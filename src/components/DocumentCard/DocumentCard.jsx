import { Download, FileText, Trash2 } from 'lucide-react';
import { formatDateTime, formatFileSize } from '../../utils/dates';
import { Badge } from '../ui';

const TYPE_TONE = { PDF: 'red', Word: 'blue', PowerPoint: 'amber' };

export default function DocumentCard({ doc, canDelete, busy, onDownload, onDelete }) {
  return (
    <li className="doc">
      <span className={`doc__icon doc__icon--${TYPE_TONE[doc.type] || 'gray'}`}><FileText size={20} /></span>
      <div className="doc__main">
        <p className="doc__name">{doc.name}</p>
        <p className="doc__meta">
          <Badge tone={TYPE_TONE[doc.type] || 'gray'}>{doc.type}</Badge>
          <span>{formatFileSize(doc.size)}</span>
          <span>Uploaded by {doc.uploadedBy?.fullName} on {formatDateTime(doc.uploadedAt)}</span>
        </p>
      </div>
      <div className="doc__actions">
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => onDownload(doc)} disabled={busy} aria-label={`Download ${doc.name}`}>
          <Download size={15} /> Download
        </button>
        {canDelete && (
          <button type="button" className="btn btn--ghost-danger btn--sm" onClick={() => onDelete(doc)} aria-label={`Delete ${doc.name}`}>
            <Trash2 size={15} /> Delete
          </button>
        )}
      </div>
    </li>
  );
}
