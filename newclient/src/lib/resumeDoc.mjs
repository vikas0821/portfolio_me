// Pure React.createElement resume-document builder (no JSX) so it can be rendered
// both in the browser (pdf().toBlob()) and in Node (renderToFile) for testing.

const buildStyles = (StyleSheet, accent) =>
  StyleSheet.create({
    page: { paddingVertical: 38, paddingHorizontal: 44, fontSize: 9.5, fontFamily: "Helvetica", color: "#1f2937" },

    header: { marginBottom: 2 },
    name: { fontSize: 21, fontFamily: "Helvetica-Bold", color: "#111827", lineHeight: 1.15 },
    role: { fontSize: 10.5, color: accent, fontFamily: "Helvetica-Bold", marginTop: 5, lineHeight: 1.2 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, color: "#4b5563", fontSize: 8.5 },
    contactItem: { marginRight: 12, marginBottom: 2 },
    rule: { borderBottomWidth: 1.2, borderBottomColor: accent, marginTop: 11, marginBottom: 12 },

    sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 13 },
    summary: { color: "#374151" },

    entry: { marginBottom: 10 },
    entryHeadRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1 },
    entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: "#111827" },
    entrySub: { color: accent, fontSize: 9.5, fontFamily: "Helvetica-Bold" },
    entryMeta: { color: "#6b7280", fontSize: 9 },

    bullet: { flexDirection: "row", marginTop: 2.5 },
    bulletDot: { width: 9, color: accent },
    bulletText: { flex: 1, color: "#374151" },

    skillRow: { flexDirection: "row", marginBottom: 4 },
    skillCat: { width: 122, fontFamily: "Helvetica-Bold", color: "#111827", fontSize: 9.5 },
    skillItems: { flex: 1, color: "#374151" },

    tag: { color: "#6b7280", fontSize: 8.5, marginTop: 2.5 },
  });

export function buildResumeDocument({ React, RP, data }) {
  const { Document, Page, View, Text } = RP;
  const accent = data?.settings?.accentColor || "#4f46e5";
  const s = buildStyles(RP.StyleSheet, accent);
  const hero = data?.hero || {};
  const h = React.createElement;

  // Sections flow/break across pages naturally (no wrap:false on the whole
  // section — that's what left big empty gaps). `minPresenceAhead` keeps a
  // section heading from being orphaned at the very bottom of a page.
  const Section = (title, children) =>
    h(View, null, h(Text, { style: s.sectionTitle, minPresenceAhead: 60 }, title), children);

  const Bullets = (items = []) =>
    items.filter(Boolean).map((t, i) =>
      h(View, { style: s.bullet, key: i }, h(Text, { style: s.bulletDot }, "›"), h(Text, { style: s.bulletText }, t))
    );

  const contacts = [hero.email, hero.phone, hero.location, hero.linkedin, hero.github, hero.website]
    .filter(Boolean)
    .map((c, i) => h(Text, { style: s.contactItem, key: i }, c));

  return h(
    Document,
    null,
    h(
      Page,
      { size: "A4", style: s.page },

      // Header (name + role + contacts inside their own block to guarantee spacing)
      h(
        View,
        { style: s.header },
        h(Text, { style: s.name }, hero.name || "Resume"),
        hero.role ? h(Text, { style: s.role }, hero.role) : null,
        contacts.length ? h(View, { style: s.contactRow }, contacts) : null
      ),
      h(View, { style: s.rule }),

      hero.summary ? Section("Summary", h(Text, { style: s.summary }, hero.summary)) : null,

      data?.experience?.length
        ? Section(
            "Experience",
            data.experience.map((e, i) =>
              h(
                View,
                { style: s.entry, key: i, wrap: false },
                h(
                  View,
                  { style: s.entryHeadRow },
                  h(Text, { style: s.entryTitle }, e.role || ""),
                  h(Text, { style: s.entryMeta }, e.period || "")
                ),
                h(
                  View,
                  { style: s.entryHeadRow },
                  h(Text, { style: s.entrySub }, e.company || ""),
                  h(Text, { style: s.entryMeta }, e.location || "")
                ),
                ...Bullets(e.responsibilities),
                e.technologies?.length ? h(Text, { style: s.tag }, "Tech: " + e.technologies.join(", ")) : null
              )
            )
          )
        : null,

      data?.projects?.length
        ? Section(
            "Projects",
            data.projects.map((p, i) =>
              h(
                View,
                { style: s.entry, key: i, wrap: false },
                h(Text, { style: s.entryTitle }, p.title || ""),
                p.description ? h(Text, { style: { ...s.summary, marginTop: 1 } }, p.description) : null,
                ...Bullets(p.points),
                p.tech?.length ? h(Text, { style: s.tag }, "Tech: " + p.tech.join(", ")) : null
              )
            )
          )
        : null,

      data?.skills?.length
        ? Section(
            "Skills",
            data.skills.map((sk, i) =>
              h(
                View,
                { style: s.skillRow, key: i },
                h(Text, { style: s.skillCat }, sk.category || ""),
                h(Text, { style: s.skillItems }, (sk.items || []).join(", "))
              )
            )
          )
        : null,

      data?.education?.length
        ? Section(
            "Education",
            data.education.map((ed, i) =>
              h(
                View,
                { style: s.entry, key: i, wrap: false },
                h(
                  View,
                  { style: s.entryHeadRow },
                  h(Text, { style: s.entryTitle }, ed.qualification || ""),
                  h(Text, { style: s.entryMeta }, [ed.year, ed.score].filter(Boolean).join(" · "))
                ),
                h(Text, { style: s.entrySub }, [ed.institution, ed.location].filter(Boolean).join(", "))
              )
            )
          )
        : null,

      data?.certifications?.length
        ? Section(
            "Certifications",
            data.certifications.map((c, i) =>
              h(
                View,
                { style: s.bullet, key: i },
                h(Text, { style: s.bulletDot }, "›"),
                h(Text, { style: s.bulletText }, [c.title, c.platform || c.issuer, c.year].filter(Boolean).join(" — "))
              )
            )
          )
        : null
    )
  );
}
