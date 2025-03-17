import axios from "axios";

class ShiprocketClient {
  private token: string | null = null;
  private baseURL = "https://apiv2.shiprocket.in/v1";

  constructor(private email: string, private password: string) {}

  private async authenticate() {
    try {
      const response = await axios.post(`${this.baseURL}/external/auth/login`, {
        email: this.email,
        password: this.password,
      });

      this.token = response.data.token;
      return this.token;
    } catch (error) {
      console.error("Shiprocket authentication error:", error);
      throw new Error("Failed to authenticate with Shiprocket");
    }
  }

  private async getHeaders() {
    if (!this.token) {
      await this.authenticate();
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  async createOrder(orderData: any) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/external/orders/create/adhoc`,
        orderData,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating Shiprocket order:", error);
      throw new Error("Failed to create shipping order");
    }
  }

  async trackShipment(shipmentId: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/external/courier/track/shipment/${shipmentId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error tracking shipment:", error);
      throw new Error("Failed to track shipment");
    }
  }

  async generateAWB(shipmentId: string, courier_id: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/external/courier/assign/awb`,
        {
          shipment_id: shipmentId,
          courier_id: courier_id,
        },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating AWB:", error);
      throw new Error("Failed to generate AWB");
    }
  }

  async generateLabel(shipmentId: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/external/courier/generate/label`,
        {
          shipment_id: [shipmentId],
        },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating label:", error);
      throw new Error("Failed to generate label");
    }
  }

  async generateManifest(shipmentId: string) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.baseURL}/external/courier/generate/manifest`,
        {
          shipment_id: [shipmentId],
        },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating manifest:", error);
      throw new Error("Failed to generate manifest");
    }
  }

  async getShippingRates(
    pickup_postcode: string,
    delivery_postcode: string,
    weight: number,
    cod: boolean = false
  ) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(
        `${this.baseURL}/external/courier/serviceability/`,
        {
          params: {
            pickup_postcode,
            delivery_postcode,
            weight,
            cod: cod ? 1 : 0,
          },
          headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching shipping rates:", error);
      throw new Error("Failed to fetch shipping rates");
    }
  }
}

// Create a singleton instance
const shiprocket = new ShiprocketClient(
  process.env.SHIPROCKET_EMAIL || "",
  process.env.SHIPROCKET_PASSWORD || ""
);

export default shiprocket;
