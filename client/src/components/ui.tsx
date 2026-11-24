import React from 'react';
import { Icon } from 'lucide-react';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className || ''}`}>
      {children}
    </div>
  );
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  className,
  icon,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactElement;
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary';
  
  const variantClasses = {
    primary: 'bg-campus-primary text-white hover:bg-campus-secondary',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outline: 'border border-campus-primary text-campus-primary hover:bg-campus-primary hover:text-white',
  };
  
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {icon ? (
        <React.Fragment>
          {icon}
          <span className="ml-2">{children}</span>
        </React.Fragment>
      ) : (
        children
      )}
    </button>
  );
};

export const Badge = ({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  className?: string;
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-campus-primary text-white',
    danger: 'bg-red-100 text-red-600',
  };
  
  return (
    <span className={[
      'inline-flex items-center rounded text-xs px-2.5 py-0.5',
      variantClasses[variant],
      className,
    ].join(' ')}>
      {children}
    </span>
  );
};

// Icon components - reusable Lucide icons
export const MailIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="mail" />;
export const UserIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="user" />;
export const MessageIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="message-circle" />;
export const UsersIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="users" />;
export const GroupIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="folder" />;
export const FolderIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="folder" />;
export const SettingsIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="settings" />;
export const LogOutIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="log-out" />;
export const SearchIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="search" />;
export const MicIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="mic" />;
export const AttachmentIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="plus" />;
export const TrashIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="trash" />;
export const CheckIcon = () => <Icon className="w-4 h-4 text-green-500" size={20} data-lucide="check" />;
export const ClockIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="clock" />;
export const UserPlusIcon = () => <Icon className="w-4 h-4 text-gray-500" size={20} data-lucide="user-plus" />;