import { posthog } from "./posthog";

export const analytics = {
  serverCreated: (type: string) => posthog.capture("server_created", { type }),
  serverDeleted: (type: string) => posthog.capture("server_deleted", { type }),
  upgradeClicked: () => posthog.capture("upgrade_clicked"),
  identifyUser: (userId: string, email: string) => {
    posthog.identify(userId, { email });
  },
};
