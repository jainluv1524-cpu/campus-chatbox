import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-2xl z-10 flex-shrink-0 transition-transform transform-ease-in-out ${
      expanded ? 'translate-x-0' : 'translate-x-full'
    } md:translate-x-0">
      <div className="h-full p-4">
        <div className="text-center mb-6">
          {user?.profilePictureUrl && (
            <img
              src={user.profilePictureUrl}
              alt={user.displayName}
              className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-campus-primary"
            />
          )}
          <h3 className="text-lg font-medium text-campus-secondary">
            {user?.displayName || 'Student'}
          </h3>
          <p className="text-xs text-gray-500">{user?.college || ''}</p>
        </div>
        
        <nav>
          <ul className="space-y-1">
            <li>
              <Link
                to="/campus"
                className="flex items-center px-3 py-2 rounded hover:bg-campus-100 text-sm font-medium transition-colors ${
                  window.location.pathname === '/campus' || window.location.pathname === '' 
                    ? 'bg-campus-primary text-white' 
                    : 'text-campus-secondary'
                }"
              >
                <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-campus-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="w-4 h-4" d="M2.25 12l8.954-3.452 3.157 8.775L2.25 21l8.516-2.945L14.707 9.688 2.25 2.388z"/>
                  </svg>
                </span>
                Campus
              </Link>
            </li>
            
            <li>
              <Link
                to="/campus/messages"
                className="flex items-center px-3 py-2 rounded hover:bg-campus-100 text-sm font-medium transition-colors ${
                  window.location.pathname.includes('/messages') ? 'bg-campus-primary text-white' : 'text-campus-secondary'
                }"
              >
                <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-campus-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="w-4 h-4" d="M21 21l-6-6l-5.3-5.3l-1.8-1.8L5.6 21H19c.8 0 1.5-.7 1.5-1.5V9c0-.8-.7-1.5-1.5-1.5H5.6l1.5-4.3L8.6 5.6c.4-.4.8-.7 1.2-.7.5 0 1 .2 1.2.7l3.9 3.9L21 21z"/>
                  </svg>
                </span>
                Messages
              </Link>
            </li>
            
            <li>
              <Link
                to="/campus/groups"
                className="flex items-center px-3 py-2 rounded hover:bg-campus-100 text-sm font-medium transition-colors ${
                  window.location.pathname.includes('/groups') ? 'bg-campus-primary text-white' : 'text-campus-secondary'
                }"
              >
                <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-campus-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="w-4 h-4" d="M13 3v7h5v3h3v5h-3v5h-5v3h-5v-3H8v-5h3v-7h5v-3H6v-5h3zM6 15h4v4H6z"/>
                  </svg>
                </span>
                Groups
              </Link>
            </li>
            
            <li>
              <Link
                to="/campus/profile"
                className="flex items-center px-3 py-2 rounded hover:bg-campus-100 text-sm font-medium transition-colors ${
                  window.location.pathname.includes('/profile') ? 'bg-campus-primary text-white' : 'text-campus-secondary'
                }"
              >
                <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-campus-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="w-4 h-4" d="M16 21v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2M19 14c1.66 0 2.99-1.34 2.99-3L22 7c0-1.66-1.33-3-3-3H6c-1.66 0-3 1.34-3 3s1.33 3 3 3h1c1.49 0 3 1.76 3.41 2h1c1.49 0 3 1.76 3.41 2z"/>
                  </svg>
                </span>
                Profile
              </Link>
            </li>
            
            <li>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center px-3 py-2 rounded hover:bg-campus-100 text-sm font-medium transition-colors"
                aria-expanded={expanded}
                aria-label="Menu"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path className="w-4 h-4" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;