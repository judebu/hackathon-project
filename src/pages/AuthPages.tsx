import { useState } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
=======
import type { ChangeEvent, MouseEvent } from 'react';
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

interface FormErrors {
  [key: string]: string;
}

<<<<<<< HEAD
export default function AuthPages() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

=======
function AuthPages() {
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
<<<<<<< HEAD
    name: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
=======
    name: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
<<<<<<< HEAD
      if (!formData.name.trim()) {
=======
      if (!formData.name) {
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
        newErrors.name = 'Name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

<<<<<<< HEAD
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        setStatus({ type: 'success', message: 'Signed in successfully. Redirecting…' });
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setStatus({ type: 'success', message: 'Account created! Redirecting…' });
      }

      setTimeout(() => navigate('/dashboard'), 800);
      setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
=======
  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (isLogin) {
        console.log('Login attempt:', { email: formData.email, password: formData.password });
        alert('Login successful! (This is a demo)');
      } else {
        console.log('Register attempt:', { 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        });
        alert('Registration successful! (This is a demo)');
      }
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
      });
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
    }
  };

  const switchMode = () => {
<<<<<<< HEAD
    setIsLogin((prev) => !prev);
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setErrors({});
    setStatus({ type: 'idle', message: '' });
=======
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    setErrors({});
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back!' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to continue' : 'Sign up to get started'}</p>
        </div>

<<<<<<< HEAD
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
=======
        <div className="auth-form">
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
              />
<<<<<<< HEAD
              {errors.name && <p className="error-message">{errors.name}</p>}
=======
              {errors.name && (
                <p className="error-message">{errors.name}</p>
              )}
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your@email.com"
            />
<<<<<<< HEAD
            {errors.email && <p className="error-message">{errors.email}</p>}
=======
            {errors.email && (
              <p className="error-message">{errors.email}</p>
            )}
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
            />
<<<<<<< HEAD
            {errors.password && <p className="error-message">{errors.password}</p>}
=======
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
              />
<<<<<<< HEAD
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            </div>
          )}

          {status.type !== 'idle' && (
            <p
              style={{
                marginBottom: '1rem',
                color: status.type === 'error' ? '#fee2e2' : '#dcfce7',
                background: status.type === 'error' ? '#7f1d1d' : '#14532d',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                textAlign: 'center',
              }}
            >
              {status.message}
            </p>
          )}

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
=======
              {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {isLogin && (
            <div className="remember-forgot">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => alert('Password reset coming soon!')}
                className="forgot-link"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button onClick={handleSubmit} className="submit-btn">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5

        <div className="auth-footer">
          <div className="divider">
            <span>Or continue with</span>
          </div>

          <p className="switch-mode">
<<<<<<< HEAD
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
=======
            {isLogin ? "Don't have an account? " : "Already have an account? "}
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
            <button type="button" onClick={switchMode}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

export default AuthPages;
>>>>>>> f423c607182ed796e47ddcce410441661046d7a5
