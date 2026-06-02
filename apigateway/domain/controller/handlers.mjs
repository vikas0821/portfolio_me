"use strict";
import { logger } from "../utils/logger.mjs";
import { getPortfolio } from "../modelservices/getportfolio.modelservice.mjs";
import { sendContactMessage } from "../modelservices/sendcontactmessage.modelservice.mjs";
import { getCertificates } from "../modelservices/getcertificates.modelservice.mjs";
import * as admin from "../modelservices/admin.modelservice.mjs";
import { getSettings, adminUpdateSettings } from "../modelservices/settings.modelservice.mjs";
import * as blog from "../modelservices/blog.modelservice.mjs";
import * as note from "../modelservices/note.modelservice.mjs";

const log = logger.child({ svc: "portfolio" });

// ── Public handlers ────────────────────────────────────────────────────────

export function buildHandlers(config) {
  return {
    async getPortfolio() {
      const data = await getPortfolio();
      return { responseCode: "00", responseMessage: "SUCCESS", data };
    },

    async sendContactMessage(msg) {
      const { name, email, message } = msg;
      const result = await sendContactMessage({ name, email, message });
      return { responseCode: "00", responseMessage: "Message sent successfully", data: result };
    },

    async getCertificates() {
      const data = await getCertificates();
      return { responseCode: "00", responseMessage: "SUCCESS", data };
    },

    async getBlogPosts() {
      const data = await blog.listBlogPosts();
      return { responseCode: "00", responseMessage: "SUCCESS", data };
    },

    async getBlogPost(msg) {
      const data = await blog.getBlogPostBySlug(msg.slug);
      if (!data) return { responseCode: "99", responseMessage: "Post not found" };
      return { responseCode: "00", responseMessage: "SUCCESS", data };
    },

    async getNotes() {
      const data = await note.listNotes();
      return { responseCode: "00", responseMessage: "SUCCESS", data };
    },
  };
}

// ── Admin operation dispatcher ─────────────────────────────────────────────
// Single Seneca cmd `adminOperation` with a `subCmd` field routes to all CRUD

const adminOps = {
  getProfile:          () => admin.adminGetProfile(),
  updateProfile:       (d) => admin.adminUpdateProfile(d.data),
  getSkills:           () => admin.adminGetSkills(),
  saveSkill:           (d) => admin.adminSaveSkill(d.data),
  deleteSkill:         (d) => admin.adminDeleteSkill(d.id),
  getProjects:         () => admin.adminGetProjects(),
  saveProject:         (d) => admin.adminSaveProject(d.data),
  deleteProject:       (d) => admin.adminDeleteProject(d.id),
  getExperience:       () => admin.adminGetExperience(),
  saveExperience:      (d) => admin.adminSaveExperience(d.data),
  deleteExperience:    (d) => admin.adminDeleteExperience(d.id),
  getEducation:        () => admin.adminGetEducation(),
  saveEducation:       (d) => admin.adminSaveEducation(d.data),
  deleteEducation:     (d) => admin.adminDeleteEducation(d.id),
  getCertifications:   () => admin.adminGetCertifications(),
  saveCertification:   (d) => admin.adminSaveCertification(d.data),
  deleteCertification: (d) => admin.adminDeleteCertification(d.id),
  getMessages:         () => admin.adminGetMessages(),
  deleteMessage:       (d) => admin.adminDeleteMessage(d.id),
  markMessageRead:     (d) => admin.adminMarkMessageRead(d.id),
  getSettings:         () => getSettings(),
  updateSettings:      (d) => adminUpdateSettings(d.data),
  getBlogPosts:        () => blog.adminGetBlogPosts(),
  saveBlogPost:        (d) => blog.adminSaveBlogPost(d.data),
  deleteBlogPost:      (d) => blog.adminDeleteBlogPost(d.id),
  getNotes:            () => note.adminGetNotes(),
  saveNote:            (d) => note.adminSaveNote(d.data),
  deleteNote:          (d) => note.adminDeleteNote(d.id),
};

export async function handleAdminOperation(msg) {
  const { subCmd, ...payload } = msg;
  if (!subCmd) throw Object.assign(new Error("subCmd required"), { status: 400 });
  const op = adminOps[subCmd];
  if (!op) throw Object.assign(new Error(`Unknown subCmd: ${subCmd}`), { status: 400 });

  try {
    const data = await op(payload);
    return { responseCode: "00", responseMessage: "SUCCESS", data };
  } catch (err) {
    log.error({ subCmd, err }, "admin operation failed");
    throw wrapHttp(err);
  }
}

function wrapHttp(err) {
  if (err?.details?.http$) return err;
  const status = err.status || (err.name === "ValidationError" ? 400 : 500);
  const e = err instanceof Error ? err : new Error(String(err));
  e.details = { ...(err.details || {}), http$: { status, body: { error: "server_error", message: err.message } } };
  return e;
}
