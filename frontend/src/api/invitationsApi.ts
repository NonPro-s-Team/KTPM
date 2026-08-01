import type {
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  CreateInvitationRequest,
  InvitationPreviewResponse,
  InvitationResponse,
} from "../types/api";
import { httpClient } from "./httpClient";

export const invitationsApi = {
  async create(request: CreateInvitationRequest) {
    const response = await httpClient.post<InvitationResponse>("/invitations", request);
    return response.data;
  },
  async getByToken(token: string) {
    const response = await httpClient.get<InvitationPreviewResponse>(
      `/invitations/${encodeURIComponent(token)}`,
    );
    return response.data;
  },
  async accept(request: AcceptInvitationRequest) {
    const response = await httpClient.post<AcceptInvitationResponse>(
      "/invitations/accept",
      request,
    );
    return response.data;
  },
};
