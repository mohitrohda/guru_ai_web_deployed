import { onRequestGet as __api_admin_leads_js_onRequestGet } from "/home/hatch/workspace/guru-ai-website/functions/api/admin/leads.js"
import { onRequestPatch as __api_admin_leads_js_onRequestPatch } from "/home/hatch/workspace/guru-ai-website/functions/api/admin/leads.js"
import { onRequestDelete as __api_chat_js_onRequestDelete } from "/home/hatch/workspace/guru-ai-website/functions/api/chat.js"
import { onRequestGet as __api_chat_js_onRequestGet } from "/home/hatch/workspace/guru-ai-website/functions/api/chat.js"
import { onRequestPatch as __api_chat_js_onRequestPatch } from "/home/hatch/workspace/guru-ai-website/functions/api/chat.js"
import { onRequestPost as __api_chat_js_onRequestPost } from "/home/hatch/workspace/guru-ai-website/functions/api/chat.js"
import { onRequestPut as __api_chat_js_onRequestPut } from "/home/hatch/workspace/guru-ai-website/functions/api/chat.js"
import { onRequestGet as __api_config_js_onRequestGet } from "/home/hatch/workspace/guru-ai-website/functions/api/config.js"
import { onRequestDelete as __api_leads_js_onRequestDelete } from "/home/hatch/workspace/guru-ai-website/functions/api/leads.js"
import { onRequestGet as __api_leads_js_onRequestGet } from "/home/hatch/workspace/guru-ai-website/functions/api/leads.js"
import { onRequestPatch as __api_leads_js_onRequestPatch } from "/home/hatch/workspace/guru-ai-website/functions/api/leads.js"
import { onRequestPost as __api_leads_js_onRequestPost } from "/home/hatch/workspace/guru-ai-website/functions/api/leads.js"
import { onRequestPut as __api_leads_js_onRequestPut } from "/home/hatch/workspace/guru-ai-website/functions/api/leads.js"

export const routes = [
    {
      routePath: "/api/admin/leads",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_leads_js_onRequestGet],
    },
  {
      routePath: "/api/admin/leads",
      mountPath: "/api/admin",
      method: "PATCH",
      middlewares: [],
      modules: [__api_admin_leads_js_onRequestPatch],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_chat_js_onRequestDelete],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_chat_js_onRequestGet],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "PATCH",
      middlewares: [],
      modules: [__api_chat_js_onRequestPatch],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_js_onRequestPost],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_chat_js_onRequestPut],
    },
  {
      routePath: "/api/config",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_config_js_onRequestGet],
    },
  {
      routePath: "/api/leads",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_leads_js_onRequestDelete],
    },
  {
      routePath: "/api/leads",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_leads_js_onRequestGet],
    },
  {
      routePath: "/api/leads",
      mountPath: "/api",
      method: "PATCH",
      middlewares: [],
      modules: [__api_leads_js_onRequestPatch],
    },
  {
      routePath: "/api/leads",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_leads_js_onRequestPost],
    },
  {
      routePath: "/api/leads",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_leads_js_onRequestPut],
    },
  ]