import axios from "./axiosInstance";

const apiService = {
  // Admin routes
  Signin: async (payload: { username: string; password: string }) => {
    try {
      const response = await axios.post("/admin/admin-login", payload);
      const data = response.data.data || response.data;
      const { access_token, refreshToken } = data;
      if (access_token) {
        const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem("points_access_token", access_token);
        localStorage.setItem("points_token_expiry", String(expiry));
      }
      if (refreshToken) {
        localStorage.setItem("points_refresh_token", refreshToken);
      }
      return data;
    } catch (error: any) {
      throw error.response?.data || { message: "Something went wrong" };
    }
  },

  getCurrentUser: async () => {
    const response = await axios.get("/admin/profile");
    return response.data;
  },

  getPools: async () => {
    const response = await axios.get("/campaigns/pools/dropdown");
    return response.data;
  },

  getCampaigns: async (page = 1, limit = 20) => {
    const response = await axios.get(`/campaigns/pools?page=${page}&limit=${limit}`);
    return response.data;
  },

  createCampaign: async (campaignData: unknown) => {
    const response = await axios.post("/campaigns/pools/bulk-eligibility", campaignData);
    return response.data;
  },

  updateCampaign: async (poolAddress: string, campaignData: unknown) => {
    const response = await axios.patch(
      `/campaigns/pools/${poolAddress}/eligibility`,
      campaignData
    );
    return response.data;
  },

  deleteCampaign: async (id: string) => {
    const response = await axios.delete(`/admin/campaign/${id}`);
    return response.data;
  },

  refreshToken: async (payload: unknown) => {
    const response = await axios.post("/auth/refresh", payload);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("points_access_token");
    localStorage.removeItem("points_refresh_token");
    localStorage.removeItem("points_token_expiry");
  },

  // User routes
  connectWallet: async (address: string) => {
    const response = await axios.post("/users/connect-wallet", { address });
    return response.data;
  },

  getLeaderboardPoints: async (page = 1, limit = 20) => {
    const response = await axios.get(
      `/points/total-points-per-user?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getUserLeaderboardPoints: async (address: string) => {
    const response = await axios.get(`/points/leaderboard?userAddress=${address}`);
    return response.data;
  },

  getUserWeeklyStats: async (address: string) => {
    const response = await axios.get(`/points/user-stats?userAddress=${address}`);
    return response.data;
  },

  getReferralInfo: async (address: string) => {
    const response = await axios.get(`/referrals/user-referral-info/${address}`);
    return response.data;
  },
};

export default apiService;
