import { useNavigate } from 'react-router-dom';

export const useMoveBack = (): (() => void) => {
  const navigate = useNavigate();
  return () => navigate(-1);
};
