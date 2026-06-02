export default function About({ profile }) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
        <h2 className="text-3xl font-bold mb-4">About Me</h2>
        <p className="text-gray-400 leading-relaxed">
          {profile.summary}
        </p>
      </div>
    </section>
  );
}
