// src/utils/campaignMapper.ts
import type { CampaignUpsertRequest } from "@/services/campaignApi";
import type { CampaignFormData } from "@/pages/CampaignCreate";

// Convert UI channels booleans -> enabledChannels array
function getEnabledChannels(channels: CampaignFormData["channels"]) {
  const enabled: string[] = [];
  if (channels.sms) enabled.push("sms");
  if (channels.ussd) enabled.push("ussd");
  if (channels.app) enabled.push("app");
  if (channels.email) enabled.push("email");
  return enabled;
}

export function buildCampaignPayload(formData: CampaignFormData, status: string): CampaignUpsertRequest {
  const enabledChannels = getEnabledChannels(formData.channels);

  return {
    basics: {
      name: formData.name,
      type: formData.type, // "incentive" | "informational"
      objective: formData.objective,
      description: formData.description,
    },
    audience: {
      selectedSegmentIds: formData.selectedSegmentIds,
      uploadedFile: null, // you currently keep uploadedFileName only; update if you support file upload
      totalTargetedCustomers: formData.totalCustomers,
    },
    communication: {
      enabledChannels,
      messages: {
        // adapt to your backend format. Example:
        sms: formData.channelMessages.sms,
        ussd: formData.channelMessages.ussd,
        app: formData.channelMessages.app,
        email: {
          en: formData.emailContent.body,
          subject: formData.emailContent.subject,
        },
      },
      email: {
        // backend example had "from"
        from: "noreply@company.com",
      },
      settings: {
        sms: {
          cap: formData.channelSettings.sms.cap,
          retryOnFailure: formData.channelSettings.sms.retryOnFailure,
          priority: formData.channelSettings.sms.priority,
        },
        ussd: {
          cap: formData.channelSettings.ussd.cap,
          retryOnFailure: formData.channelSettings.ussd.retryOnFailure,
          priority: formData.channelSettings.ussd.priority,
        },
        app: {
          cap: formData.channelSettings.app.cap,
          retryOnFailure: formData.channelSettings.app.retryOnFailure,
          priority: formData.channelSettings.app.priority,
        },
        email: {
          cap: formData.channelSettings.email.cap,
          retryOnFailure: formData.channelSettings.email.retryOnFailure,
          priority: formData.channelSettings.email.priority,
        },
      },
    },
    rewards: {
      type: formData.rewardType === "other" ? formData.rewardTypeOther : formData.rewardType,
      value: formData.rewardValue,
      caps: {
        perCustomer: formData.rewardCapPerCustomer,
        campaignCap: formData.rewardCapPerDay, // NOTE: your UI calls this "per day"; API sample calls it "campaignCap"
      },
      disbursementAccount: {
        id: formData.rewardAccountId,
      },
    },
    scheduling: {
      type: formData.scheduleType, // "immediate" | "scheduled"
      startDate: formData.startDate,
      endDate: formData.endDate,
      frequencyCap: formData.frequencyCap,
    },
    status, // "draft"
  };
}
