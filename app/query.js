// apiMutations.js

import { useMutation, useQuery, useQueryClient } from "react-query";
import { createRequest, deleteRequest, getRequest, updateRequest } from "@/app/api";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

export const useCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, url, queryKey }) => {
      const token = localStorage.getItem("meatmetokenAdmin"); // Ensure token is fetched client-side
      return createRequest(data, url, token);
    },
    onSuccess: (response, { queryKey }) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      toast.error(error.response.data.message || "An error occurred");
    },
  });
};

export const useUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, url, queryKey }) => {
      const token = localStorage.getItem("meatmetokenAdmin"); // Ensure token is fetched client-side
      return updateRequest(data, url, token);
    },
    onSuccess: (response, { queryKey }) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      if (queryKey === "admin") {
        localStorage.setItem("meatmeAdmin", JSON.stringify(response.data.admin));
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || "An error occurred");
    },
  });
};


export const useDeleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, url, queryKey }) => {
      const token = localStorage.getItem("meatmetokenAdmin"); // Ensure token is fetched client-side
      return deleteRequest(id, url, token);
    },
    onSuccess: (response, { queryKey }) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => {
      toast.error(error.response.data.message || "An error occurred");
    },
  });
};

export const useGetQuery = ({ queryKey, url }) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const token = localStorage.getItem("meatmetokenAdmin"); // Ensure token is fetched client-side
      const response = await getRequest(url, token);
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
  });
};
