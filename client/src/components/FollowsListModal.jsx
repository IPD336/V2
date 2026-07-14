import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from './Spinner';
import { initials } from '../utils';
import { useFocusTrap } from '../utils/hooks';

export default function FollowsListModal({ userId, type, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const endpoint = `/users/${userId}/${type}`;
        const res = await api.get(endpoint);
        setUsers(res.data[type] || []);
      } catch (err) {
        if (import.meta.env.DEV) console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [userId, type]);

  const handleUserClick = (targetId) => {
    navigate(`/profile/${targetId}`);
    onClose();
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} ref={trapRef}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-heading" style={{ textTransform: 'capitalize', fontSize: 20 }}>
          {type === 'followers' ? 'Followers' : 'Following'}
        </div>
        
        {loading ? (
          <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
            <Spinner />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', marginTop: 16, paddingRight: 4 }}>
            {users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--muted)', fontSize: 14 }}>
                No users found.
              </div>
            ) : (
              users.map((u) => (
                <div 
                  key={u._id} 
                  onClick={() => handleUserClick(u._id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '10px 12px', 
                    borderRadius: 10, 
                    cursor: 'pointer', 
                    transition: 'background 0.2s',
                    marginBottom: 4
                  }}
                  className="workspace-item"
                >
                  <div style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 10, 
                    background: u.avatarUrl ? `url(${u.avatarUrl}) center/cover` : (u.avatarColor || 'var(--accent)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {!u.avatarUrl && initials(u.name)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    {u.bio && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{u.bio}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
