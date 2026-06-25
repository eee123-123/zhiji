import Link from "next/link";

const modules = [
  { href: "/tarot", icon: "🎴", title: "问牌", desc: "塔罗指引，映照你的内心" },
  { href: "/wellness", icon: "🌿", title: "养元", desc: "古籍养生，感知身体信号" },
  { href: "/dream", icon: "🌙", title: "解梦", desc: "梦境解析，探索深层自我" },
  { href: "/profile", icon: "🪞", title: "觉察档案", desc: "看见你的成长轨迹" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-20">
      {/* 品牌区域 */}
      <section className="text-center mb-12 md:mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-zhiji-gold tracking-wide">
          知几
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mt-3 font-light">
          自我觉察空间
        </p>
        <p className="text-sm md:text-base text-white/50 mt-2">
          从不同角度认识自己
        </p>
      </section>

      {/* 一键抽牌 CTA */}
      <section className="mb-14 md:mb-18 text-center">
        <Link
          href="/tarot"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-zhiji-gold to-zhiji-gold-light px-8 py-4 text-lg font-semibold text-zhiji-dark shadow-lg shadow-zhiji-gold/20 transition-all duration-300 hover:scale-105 hover:shadow-zhiji-gold/40 active:scale-95"
        >
          ✦ 一键抽牌
        </Link>
        <p className="text-white/40 text-sm mt-3">30秒获得今日灵感</p>
      </section>

      {/* 四大模块入口 */}
      <section className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-5 backdrop-blur-sm transition-all duration-300 hover:border-zhiji-gold/40 hover:bg-white/8 hover:shadow-md hover:shadow-zhiji-gold/5"
          >
            <span className="text-3xl shrink-0">{m.icon}</span>
            <div>
              <h3 className="text-base font-medium text-white group-hover:text-zhiji-gold-light transition-colors duration-300">
                {m.title}
              </h3>
              <p className="text-sm text-white/50 mt-0.5">{m.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* 底部 slogan */}
      <footer className="mt-auto pt-16 pb-6 text-center">
        <p className="text-white/25 text-xs tracking-widest">
          「 向内看，看见真实的自己 」
        </p>
      </footer>
    </div>
  );
}
