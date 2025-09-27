// Re-export the optimized auth context to maintain compatibility
// This prevents import errors and ensures all components use the optimized auth
export { 
  useOptimizedAuth as useAuth,
  OptimizedAuthProvider as AuthProvider 
} from './OptimizedAuthContext';