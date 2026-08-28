import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router';
import LoadingScreen from '../../../components/LoadingScreen';

const Protected = ({ children }) => {
  const user = useSelector(state => state.auth.user);
  const loading = useSelector(state => state.auth.loading);
  if (loading) {
    return <LoadingScreen message="Verifying authentication..." />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (!user.verified) {
    return <Navigate to="/verify-email" replace />
  }
  return (
    children
  )
}

export default Protected

