import React, { useState } from "react";
import { useCreateMutation } from "../query"; // Ensure this is correctly imported
import { IoCloudUploadOutline } from "react-icons/io5";
const AddBulkProduct = ({ onClose, file, setFile }) => {
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [delayedProgress, setDelayedProgress] = useState(0);

  const createMutation = useCreateMutation();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError(null);
    setProgress(0);
    setDelayedProgress(0);

    // Simulate initial 2 seconds delay before real progress starts
    setTimeout(() => {
      createMutation.mutate(
        {
          data: formData,
          url: `bulk-product/bulk-upload`,
          queryKey: "Products",
        },
        {
          onSuccess: () => {
            setUploading(false);
            setFile(null);
            onClose();
          },
          onError: (error) => {
            setUploading(false);
            setError(error.response?.data?.message || "An error occurred");
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
            setDelayedProgress(percentCompleted);
          },
        }
      );
    }, 2000); // 2 seconds delay
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <div className="border-dashed border-2 border-gray-300 rounded-md p-10 mt-4 w-full max-w-lg flex justify-center items-center cursor-pointer">
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <IoCloudUploadOutline className="text-4xl" />
          <span className="mt-2 text-gray-500">Upload Bulk Order File</span>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {file && (
        <div className="mt-2 text-gray-700">
          <p>Selected file: {file.name}</p>
        </div>
      )}

      <button
        className="bg-[#E62F39] text-white border-none py-2 w-full max-w-lg rounded-md my-4"
        onClick={handleFileUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>

      {uploading && (
        <div className="w-full max-w-lg text-center">
          <p>Uploading: {delayedProgress}%</p>
          <progress value={delayedProgress} max="100" className="w-full" />
        </div>
      )}
    </div>
  );
};

export default AddBulkProduct;
