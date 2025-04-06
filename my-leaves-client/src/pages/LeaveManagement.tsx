import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { LeaveList } from '../components/leaves/LeaveList';
import { LeaveForm } from '../components/leaves/LeaveForm';
import { useLeaves } from '../hooks/useLeaves';

export const LeaveManagement = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const {
    leaves,
    isLoading,
    error,
    createLeave,
    isCreating,
    deleteLeave,
  } = useLeaves();

  const handleSubmit = (formData) => {
    createLeave(formData, {
      onSuccess: () => {
        setIsFormVisible(false);
      }
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Leave Requests</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? 'Cancel' : 'Request Leave'}
        </button>
      </div>

      {isFormVisible && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">New Leave Request</h2>
            <LeaveForm onSubmit={handleSubmit} isSubmitting={isCreating} />
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <LeaveList
            leaves={leaves}
            isLoading={isLoading}
            error={error}
            onDelete={deleteLeave}
          />
        </div>
      </div>
    </Layout>
  );
};