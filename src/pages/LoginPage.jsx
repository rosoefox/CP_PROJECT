import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Field from '../components/Field';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { validateCredentials } from '../domain/credentials';

const EMPTY = { email: '', password: '', passwordConfirm: '', displayName: '' };

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 로그인 후 원래 가려던 페이지로 돌아갑니다.
  const redirectTo = location.state?.from ?? '/';

  if (loading) return <p className="muted">로그인 상태 확인 중…</p>;
  if (user) return <Navigate to={redirectTo} replace />;

  const isSignup = mode === 'signup';

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setErrors({});
    setSubmitError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCredentials(values, mode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const email = values.email.trim();
      if (isSignup) {
        await authService.signUp(email, values.password, values.displayName.trim());
      } else {
        await authService.signIn(email, values.password);
      }
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setSubmitError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h2>{isSignup ? '회원가입' : '로그인'}</h2>
        <p className="muted">🐄 축산 케어 · 우리 농장 가축 건강 관리</p>

        {isSignup && (
          <Field label="농장(사용자) 이름" error={errors.displayName}>
            <input name="displayName" value={values.displayName} onChange={handleChange} placeholder="예: 행복농장" />
          </Field>
        )}
        <Field label="이메일" error={errors.email}>
          <input type="email" name="email" value={values.email} onChange={handleChange} autoComplete="email" />
        </Field>
        <Field label="비밀번호" error={errors.password}>
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
        </Field>
        {isSignup && (
          <Field label="비밀번호 확인" error={errors.passwordConfirm}>
            <input
              type="password"
              name="passwordConfirm"
              value={values.passwordConfirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </Field>
        )}

        {submitError && <p className="alert alert-danger">{submitError}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? '처리 중…' : isSignup ? '가입하기' : '로그인'}
        </button>
        <button type="button" className="btn-link" onClick={switchMode}>
          {isSignup ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
