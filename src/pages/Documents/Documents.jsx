import { useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { useProjectContext } from '../../hooks/useProjectContext';
import { useToast } from '../../context/ToastContext';
import { documentsApi } from '../../services/api';
import { validateFile } from '../../utils/validators';
import { ACCEPTED_EXTENSIONS, MAX_UPLOAD_MB } from '../../utils/constants';
import { saveBlob } from '../../utils/download';
import { EmptyState } from '../../components/ui';
import { ConfirmDialog } from '../../components/Modal/Modal';
import DocumentCard from '../../components/DocumentCard/DocumentCard';

export default function DocumentsTab() {
  const { project, canManage, reload } = useProjectContext();
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const upload = async (fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    setError('');
    const problem = files.map(validateFile).find(Boolean);
    if (problem) { setError(problem); return; }
    setUploading(true);
    try {
      for (const file of files) await documentsApi.upload(project.id, file);
      toast.success(files.length > 1 ? `${files.length} documents uploaded.` : 'Document uploaded.');
      reload({ silent: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const download = async (doc) => {
    setDownloadingId(doc.id);
    try {
      saveBlob(await documentsApi.download(doc.id), doc.name);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await documentsApi.remove(toDelete.id);
      toast.success(`${toDelete.name} was deleted.`);
      setToDelete(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="tab-panel">
      <div className="tab-panel__head">
        <div>
          <h2 className="section__title">Documents</h2>
          <p className="muted">PDF, Word and PowerPoint files, up to {MAX_UPLOAD_MB} MB each.</p>
        </div>
        {canManage && (
          <button type="button" className="btn btn--primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload size={17} /> {uploading ? 'Uploading…' : 'Upload document'}
          </button>
        )}
      </div>

      {canManage && (
        <>
          <input
            ref={inputRef}
            type="file"
            hidden
            multiple
            accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',')}
            onChange={(e) => upload(e.target.files)}
            aria-label="Choose documents to upload"
          />
          <div
            className={`dropzone ${dragging ? 'is-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
          >
            <Upload size={20} />
            <span>Drag files here, or use the Upload document button.</span>
          </div>
        </>
      )}
      {error && <div className="alert alert--error" role="alert">{error}</div>}

      {project.documents.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="No documents yet"
            message={canManage ? 'Upload proposals, reports and slide decks so the whole team and your supervisor can find them.' : 'The team has not uploaded any documents yet.'}
          />
        </div>
      ) : (
        <ul className="docs card card--flush">
          {project.documents.map((d) => (
            <DocumentCard key={d.id} doc={d} canDelete={canManage} busy={downloadingId === d.id} onDownload={download} onDelete={setToDelete} />
          ))}
        </ul>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this document?"
          message={`"${toDelete.name}" will be permanently removed for everyone on the team. This cannot be undone.`}
          confirmLabel="Delete document"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
