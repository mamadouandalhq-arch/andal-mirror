import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { UpdateProfileFormData } from '@/lib/validations/profile';

export interface UpdateProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  city?: string | null;
  street?: string | null;
  building?: string | null;
  apartment?: string | null;
  avatarUrl?: string | null;
  role: string;
  pointsBalance?: number;
  createdAt?: string;
  googleId?: string | null;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileFormData) => {
      return apiClient.post<UpdateProfileResponse>('/user/update', data);
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
