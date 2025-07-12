
import { useAuth } from "../context/AuthContext";

type Permission = 
  | 'create:course' 
  | 'edit:course' 
  | 'delete:course'
  | 'schedule:session'
  | 'manage:sessions'
  | 'view:analytics'
  | 'view:enrollments'
  | 'download:certificate'
  | 'rate:course'
  | 'comment:lesson';

export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    // Define role-based permissions
    const rolePermissions: Record<string, Permission[]> = {
      teacher: [
        'create:course',
        'edit:course', 
        'delete:course',
        'schedule:session',
        'manage:sessions',
        'view:analytics',
        'view:enrollments'
      ],
      student: [
        'download:certificate',
        'rate:course',
        'comment:lesson'
      ]
    };
    
    // Check if the user's role has the requested permission
    return rolePermissions[user.role]?.includes(permission) || false;
  };
  
  const isTeacher = (): boolean => {
    return user?.role === 'teacher';
  };
  
  const isStudent = (): boolean => {
    return user?.role === 'student';
  };
  
  return {
    hasPermission,
    isTeacher,
    isStudent
  };
}
