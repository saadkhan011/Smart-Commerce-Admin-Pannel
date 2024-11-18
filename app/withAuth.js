import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spin } from 'antd';

const withAuth = (WrappedComponent) => {
  const ComponentWithAuth = (props) => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        // Show loader for 3 seconds
        await new Promise(resolve => setTimeout(resolve, 1000));

        const token = localStorage.getItem("meatmetokenAdmin");
        if (!token) {
          router.push("/login"); // Redirect to login if no token is found
        } else {
          setLoading(false); // Stop loading after authentication check
        }
      };

      checkAuth();
    }, [router]);

    if (loading) {
      // Display a loading spinner with custom size
      return (
        <div className="spinner-container flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithAuth;
};

export default withAuth;
