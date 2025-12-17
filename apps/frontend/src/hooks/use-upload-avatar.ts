import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface UploadAvatarResponse {
  avatarUrl: string;
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      return apiClient.post<UploadAvatarResponse>(
        '/user/upload-avatar',
        formData,
      );
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
