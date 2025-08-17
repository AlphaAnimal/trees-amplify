import { defineStorage } from "@aws-amplify/backend";
export const storage = defineStorage({
  name: "amplifyTreesDrive",
  access: (allow) => ({
    "media/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
});
