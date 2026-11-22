import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Camera, CheckCircle, KeyRound, LoaderCircle, PackageCheck, RefreshCw, Upload } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { EmptyState } from '../../../components/shared/SharedComponents';
import { courierDeliveriesApi } from '../api/deliveries.api';
import { proofOfDeliveryApi } from '../api/proof-of-delivery.api';
import type { DeliveryCompletionResponse, DeliveryPhotoProofResponse, OtpChallengeReceipt } from '../types/proof-of-delivery.types';
import './ProofOfDelivery.css';

const PAGE_SIZE = 20;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const OTP_UNAVAILABLE_MESSAGE = 'OTP delivery is currently unavailable. Please try again later.';

const requestErrorMessage = (error: unknown, fallback: string, otpDeliveryRequest = false) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as { message?: unknown } | undefined;
    if (otpDeliveryRequest && status === 503) return OTP_UNAVAILABLE_MESSAGE;
    if (status === 401) return 'Your session has expired. Sign in again to continue.';
    if (status === 403) return 'This delivery is no longer assigned to your courier account.';
    if (status === 409) return 'The assignment or proof changed. Refresh the delivery and restart proof verification.';
    if (status === 422) return 'The server could not accept this proof. Check the selected delivery and try again.';
    if (status === 429) return 'Please wait for the resend cooldown before requesting another OTP.';
    if (status === 503) return 'A required delivery service is temporarily unavailable. Your proof was not confirmed.';
    if (typeof responseData?.message === 'string' && responseData.message.trim()) return responseData.message;
  }
  return error instanceof Error ? error.message : fallback;
};

const ProofOfDelivery: React.FC = () => {
  const queryClient = useQueryClient();
  const [deliveryPage, setDeliveryPage] = useState(0);
  const { data, error: deliveriesError, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['courier', 'assigned-deliveries', deliveryPage, PAGE_SIZE],
    queryFn: () => courierDeliveriesApi.getAssignedDeliveries({ page: deliveryPage, size: PAGE_SIZE }),
  });
  const [assignmentId, setAssignmentId] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState<OtpChallengeReceipt | null>(null);
  const [verifiedChallengeId, setVerifiedChallengeId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoProof, setPhotoProof] = useState<DeliveryPhotoProofResponse | null>(null);
  const [completion, setCompletion] = useState<DeliveryCompletionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const delivery = data?.content.find(item => String(item.assignmentId) === assignmentId) ?? null;
  const requestOtp = useMutation({ mutationFn: (parcelId: string) => proofOfDeliveryApi.requestOtp(parcelId) });
  const verifyOtp = useMutation({ mutationFn: (args: { parcelId: string; challengeId: string; code: string }) => proofOfDeliveryApi.verifyOtp(args.parcelId, args.challengeId, args.code) });
  const uploadPhoto = useMutation({ mutationFn: (args: { parcelId: string; assignmentId: number; photo: File }) => proofOfDeliveryApi.uploadPhoto(args.parcelId, args.assignmentId, args.photo) });
  const completeDelivery = useMutation({ mutationFn: (args: { parcelId: string; challengeId: string; photoProofId: string }) => proofOfDeliveryApi.completeDelivery(args.parcelId, args.challengeId, args.photoProofId) });

  useEffect(() => {
    if (!photo) return;
    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreview(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setPhotoPreview(null);
    };
  }, [photo]);

  const anyRequestPending = requestOtp.isPending || verifyOtp.isPending || uploadPhoto.isPending || completeDelivery.isPending;
  const workflowStarted = !!challenge || !!verifiedChallengeId || !!photoProof;

  const clearWorkflow = () => {
    setChallenge(null);
    setVerifiedChallengeId(null);
    setOtp('');
    setPhoto(null);
    setPhotoProof(null);
    setCompletion(null);
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleSelectDelivery = (nextAssignmentId: string) => {
    if (anyRequestPending || workflowStarted) return;
    clearWorkflow();
    setAssignmentId(nextAssignmentId);
  };

  const handleDeliveryPageChange = (nextPage: number) => {
    if (anyRequestPending || workflowStarted) return;
    clearWorkflow();
    setAssignmentId('');
    setDeliveryPage(Math.max(0, nextPage));
  };

  const handleRequestOtp = async () => {
    if (!delivery || delivery.status !== 'in_transit') return;
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const receipt = await requestOtp.mutateAsync(delivery.parcelId);
      // Only replace local proof state after the server confirms the new challenge was issued.
      setChallenge(receipt);
      setVerifiedChallengeId(null);
      setOtp('');
      setInfoMessage(`A verification code was requested for ${receipt.destinationMasked}. The code is sent to the recipient and is never shown here.`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 503) {
        // The server may have created then invalidated an undeliverable challenge.
        setChallenge(null);
        setVerifiedChallengeId(null);
        setOtp('');
      }
      if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 409)) {
        clearWorkflow();
        setAssignmentId('');
        await queryClient.invalidateQueries({ queryKey: ['courier', 'assigned-deliveries'] });
      }
      setErrorMessage(requestErrorMessage(error, 'Could not request a delivery OTP. Please try again.', true));
    }
  };

  const handleVerifyOtp = async () => {
    if (!delivery || !challenge || !/^\d{6}$/.test(otp)) return;
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const result = await verifyOtp.mutateAsync({ parcelId: delivery.parcelId, challengeId: challenge.challengeId, code: otp });
      if (result.outcome === 'VERIFIED' && result.challengeId === challenge.challengeId && result.verifiedAt) {
        setVerifiedChallengeId(result.challengeId);
        setInfoMessage('Recipient OTP verified by the server.');
      } else if (result.outcome === 'VERIFIED') {
        setVerifiedChallengeId(null);
        setErrorMessage('The server response did not confirm the selected OTP challenge.');
      } else {
        setVerifiedChallengeId(null);
        const messages = {
          INVALID: 'That code was not accepted. Check it and try again.',
          EXPIRED: 'This verification code has expired. Request a new code.',
          EXHAUSTED: 'OTP attempts are exhausted. Request a new code.',
        } as const;
        setErrorMessage(messages[result.outcome]);
        if (result.outcome === 'EXPIRED' || result.outcome === 'EXHAUSTED') {
          setChallenge(null);
          setOtp('');
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 409)) {
        clearWorkflow();
        setAssignmentId('');
        await queryClient.invalidateQueries({ queryKey: ['courier', 'assigned-deliveries'] });
      }
      setErrorMessage(requestErrorMessage(error, 'Could not verify the OTP. Please try again.'));
    }
  };

  const handlePhotoSelection = (file: File | undefined) => {
    setErrorMessage(null);
    setInfoMessage(null);
    setPhotoProof(null);
    if (!file) {
      setPhoto(null);
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhoto(null);
      setErrorMessage('Choose a JPEG or PNG image.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhoto(null);
      setErrorMessage('The photo must be 5 MiB or smaller.');
      return;
    }
    setPhoto(file);
  };

  const handleUploadPhoto = async () => {
    if (!delivery || delivery.status !== 'in_transit' || !photo) return;
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const result = await uploadPhoto.mutateAsync({ parcelId: delivery.parcelId, assignmentId: delivery.assignmentId, photo });
      setPhotoProof(result);
      setInfoMessage('Photo proof was accepted by the server.');
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 409)) {
        clearWorkflow();
        setAssignmentId('');
        await queryClient.invalidateQueries({ queryKey: ['courier', 'assigned-deliveries'] });
      }
      setErrorMessage(requestErrorMessage(error, 'Could not upload the delivery photo. Please try again.'));
    }
  };

  const handleComplete = async () => {
    if (!delivery || !verifiedChallengeId || !photoProof) return;
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const result = await completeDelivery.mutateAsync({
        parcelId: delivery.parcelId,
        challengeId: verifiedChallengeId,
        photoProofId: photoProof.proofId,
      });
      if (result.status !== 'delivered' || result.parcelId !== delivery.parcelId || !result.completedAt) {
        throw new Error('The server response did not confirm delivery completion.');
      }
      setCompletion(result);
      await queryClient.invalidateQueries({ queryKey: ['courier', 'assigned-deliveries'] });
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 409)) {
        clearWorkflow();
        setAssignmentId('');
        await queryClient.invalidateQueries({ queryKey: ['courier', 'assigned-deliveries'] });
      }
      setErrorMessage(requestErrorMessage(error, 'Could not complete this delivery. Please retry.'));
    }
  };

  const retryableRequestError = (error: unknown) => requestErrorMessage(error, 'The request failed. Please try again.');

  return (
    <DashboardLayout>
      <div className="page-header pod-page-heading">
        <div>
          <h1 className="page-title">Proof of Delivery</h1>
          <p className="page-subtitle">Verify the recipient, upload a delivery photo, and complete the assignment.</p>
        </div>
        <Link to="/courier/deliveries" className="btn btn-secondary"><ArrowLeft size={16} /> Assigned deliveries</Link>
      </div>

      {completion ? (
        <section className="card pod-completion-card" role="status">
          <div className="pod-completion-icon"><CheckCircle size={32} /></div>
          <h2>Delivery completed</h2>
          <p><strong>{completion.parcelId}</strong> was marked delivered by the server at {new Date(completion.completedAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })}.</p>
          <Link to="/courier/deliveries" className="btn btn-primary">Back to assigned deliveries</Link>
        </section>
      ) : (
        <div className="pod-layout">
          <section className="card pod-selection-card">
            <div className="card-header"><span className="card-title">Select your assignment</span></div>
            <div className="card-body">
              {isPending ? (
                <div className="pod-loading" role="status"><LoaderCircle className="pod-spin" size={18} /> Loading your assigned deliveries…</div>
              ) : isError ? (
                <EmptyState icon={<AlertCircle size={25} />} title="Assignments could not be loaded" description={retryableRequestError(deliveriesError)} action={<button className="btn btn-primary" onClick={() => void refetch()} disabled={isFetching}>{isFetching ? 'Retrying…' : 'Retry'}</button>} />
              ) : data?.content.length ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="pod-assignment">Assigned parcel</label>
                  <select id="pod-assignment" className="form-input" value={assignmentId} onChange={event => handleSelectDelivery(event.target.value)} disabled={anyRequestPending || workflowStarted}>
                    <option value="">Choose a parcel</option>
                    {data.content.map(item => <option value={item.assignmentId} key={item.assignmentId}>{item.trackingNumber} · {item.parcelId} · {item.recipientName}</option>)}
                  </select>
                </div>
              ) : (
                <EmptyState icon={<PackageCheck size={25} />} title="No assigned deliveries" description="A parcel assigned to you will appear here when it is ready for delivery." />
              )}

              {data && (deliveryPage > 0 || data.hasNext) && <nav className="pod-delivery-pagination" aria-label="Assigned deliveries for proof of delivery">
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => handleDeliveryPageChange(deliveryPage - 1)} disabled={deliveryPage === 0 || isFetching || anyRequestPending || workflowStarted}><ArrowLeft size={15} /> Previous</button>
                <span>Page {data.page + 1}{isFetching ? ' · Updating' : ''}</span>
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => handleDeliveryPageChange(deliveryPage + 1)} disabled={!data.hasNext || isFetching || anyRequestPending || workflowStarted}>Next <ArrowRight size={15} /></button>
              </nav>}
              {workflowStarted && <p className="pod-help pod-workflow-lock-note">Finish the current proof workflow before switching to another assignment.</p>}

              {delivery && <div className="pod-assignment-summary">
                <div><span>Parcel</span><strong>{delivery.parcelId}</strong></div>
                <div><span>Recipient</span><strong>{delivery.recipientName}</strong></div>
                <div><span>Delivery address</span><strong>{delivery.deliveryAddress}</strong></div>
                <div><span>Status</span><strong className={delivery.status === 'in_transit' ? 'pod-status-ready' : 'pod-status-waiting'}>{delivery.status.replaceAll('_', ' ')}</strong></div>
                {delivery.status !== 'in_transit' && <p className="pod-inline-note">OTP, photo upload and completion are available when the parcel is in transit.</p>}
              </div>}
            </div>
          </section>

          <div className="pod-workflow">
            <section className="card">
              <div className="card-header"><span className="card-title">1. Recipient verification</span>{verifiedChallengeId && <CheckCircle size={18} color="var(--success)" />}</div>
              <div className="card-body pod-step-body">
                <button className="btn btn-secondary" type="button" onClick={() => void handleRequestOtp()} disabled={!delivery || delivery.status !== 'in_transit' || requestOtp.isPending || anyRequestPending}>
                  {requestOtp.isPending ? <><LoaderCircle className="pod-spin" size={16} /> Requesting…</> : <><RefreshCw size={16} /> {challenge ? 'Resend OTP' : 'Request OTP'}</>}
                </button>
                {challenge && <p className="pod-help">Challenge expires {new Date(challenge.expiresAt).toLocaleString('en-LK', { dateStyle: 'short', timeStyle: 'short' })}. Resend is controlled by the server cooldown.</p>}
                <label className="form-group" htmlFor="pod-otp">
                  <span className="form-label">Six-digit recipient code</span>
                  <span className="pod-otp-input"><KeyRound size={17} /><input id="pod-otp" value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" maxLength={6} disabled={!challenge || !!verifiedChallengeId || anyRequestPending} /></span>
                </label>
                <button className="btn btn-primary" type="button" onClick={() => void handleVerifyOtp()} disabled={!challenge || otp.length !== 6 || !!verifiedChallengeId || anyRequestPending}>
                  {verifyOtp.isPending ? <><LoaderCircle className="pod-spin" size={16} /> Verifying…</> : <><CheckCircle size={16} /> Verify OTP</>}
                </button>
                {verifiedChallengeId && <p className="pod-success-note">OTP verified by the backend.</p>}
              </div>
            </section>

            <section className="card">
              <div className="card-header"><span className="card-title">2. Delivery photo</span>{photoProof && <CheckCircle size={18} color="var(--success)" />}</div>
              <div className="card-body pod-step-body">
                <label className={`pod-photo-picker${photoProof ? ' pod-photo-picker-locked' : ''}`} htmlFor="pod-photo">
                  {photoPreview ? <img src={photoPreview} alt="Selected delivery proof preview" /> : <Camera size={28} />}
                  <span>{photo ? photo.name : 'Choose or capture a photo'}</span>
                  <small>JPEG or PNG · up to 5 MiB</small>
                </label>
                <input id="pod-photo" className="pod-file-input" type="file" accept="image/jpeg,image/png" capture="environment" onChange={event => { handlePhotoSelection(event.target.files?.[0]); event.currentTarget.value = ''; }} disabled={!delivery || delivery.status !== 'in_transit' || anyRequestPending || !!photoProof} />
                {photo && !photoProof && <button className="btn btn-secondary" type="button" onClick={() => { setPhoto(null); setPhotoProof(null); }} disabled={anyRequestPending}>Remove photo</button>}
                <button className="btn btn-primary" type="button" onClick={() => void handleUploadPhoto()} disabled={!delivery || delivery.status !== 'in_transit' || !photo || !!photoProof || anyRequestPending}>
                  {uploadPhoto.isPending ? <><LoaderCircle className="pod-spin" size={16} /> Uploading…</> : <><Upload size={16} /> Upload proof photo</>}
                </button>
                {photoProof && <p className="pod-success-note">Photo proof accepted · {photoProof.format.toUpperCase()} · {(photoProof.byteSize / 1024).toFixed(0)} KiB</p>}
                <p className="pod-help">Photo selection and upload remain available if OTP delivery is temporarily unavailable. The backend validates the actual image content.</p>
              </div>
            </section>

            <section className="card pod-finish-card">
              <div className="card-body pod-step-body">
                <button className="btn btn-success btn-lg" type="button" onClick={() => void handleComplete()} disabled={!delivery || !verifiedChallengeId || !photoProof || anyRequestPending}>
                  {completeDelivery.isPending ? <><LoaderCircle className="pod-spin" size={17} /> Completing…</> : <><CheckCircle size={17} /> Complete delivery</>}
                </button>
                <p className="pod-help">Completion is enabled after the backend verifies the OTP and accepts the photo proof.</p>
              </div>
            </section>
          </div>
        </div>
      )}

      {errorMessage && <div className="pod-feedback pod-feedback-error" role="alert"><AlertCircle size={17} /><span>{errorMessage}</span></div>}
      {infoMessage && !errorMessage && <div className="pod-feedback pod-feedback-info" role="status"><CheckCircle size={17} /><span>{infoMessage}</span></div>}
    </DashboardLayout>
  );
};

export default ProofOfDelivery;
