"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useState } from "react";

const documentation = [
  {
    id: "DOC-01",
    category: "GETTING_STARTED",
    question: "What is Simulark?",
    answer:
      "Simulark is an architecture design platform that transforms natural language descriptions into production-ready infrastructure diagrams. It bridges the gap between conceptual design and implementation.",
  },
  {
    id: "DOC-02",
    category: "PLATFORM",
    question: "How does the AI generation work?",
    answer:
      "Our AI engine analyzes your natural language input, identifies architectural patterns, and generates appropriate infrastructure diagrams. It understands context, constraints, and best practices to create optimal designs.",
  },
  {
    id: "DOC-03",
    category: "EXPORT",
    question: "What formats can I export to?",
    answer:
      "Simulark supports export to Terraform (HCL), Kubernetes YAML, Docker Compose, AWS CloudFormation, Azure ARM templates, and more. You can also generate implementation code stubs in various languages.",
  },
  {
    id: "DOC-04",
    category: "INTEGRATION",
    question: "Does it integrate with my IDE?",
    answer:
      "Yes. Simulark exports architectural context in formats compatible with Cursor, Claude Code, Windsurf, and other AI-powered IDEs via the Model Context Protocol (MCP).",
  },
  {
    id: "DOC-05",
    category: "SECURITY",
    question: "Is my architecture data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption, never train on your data, and offer SOC 2 Type II compliance. Enterprise plans include SSO, audit logs, and on-premise deployment options.",
  },
  {
    id: "DOC-06",
    category: "COLLABORATION",
    question: "Can my team collaborate?",
    answer:
      "Yes. Team and Enterprise plans support real-time collaboration, comments, version history, and role-based access control. Multiple team members can work on the same architecture simultaneously.",
  },
];

function FAQItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof documentation)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      className="border border-brand-charcoal/10 bg-white"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-start justify-between gap-4 text-left group"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[9px] uppercase text-brand-charcoal/40">
              {item.id}
            </span>
            <span className="text-brand-charcoal/20">|</span>
            <span className="font-mono text-[8px] uppercase tracking-wider text-brand-orange">
              {item.category}
            </span>
          </div>
          <h3 className="font-mono text-sm font-bold text-brand-charcoal uppercase tracking-wide group-hover:text-brand-orange transition-colors">
            {item.question}
          </h3>
        </div>
        <motion.div
          className="w-6 h-6 border border-brand-charcoal/20 flex items-center justify-center shrink-0 mt-1"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon icon="lucide:plus" className="w-3 h-3 text-brand-charcoal/60" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0">
              <div className="border-t border-brand-charcoal/5 pt-4">
                <p className="text-brand-charcoal/60 font-lora leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DocumentationFAQ() {
  const [openId, setOpenId] = useState<string | null>("DOC-01");

  return (
    <section className="py-32 bg-[#faf9f5] relative overflow-hidden">
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(26,26,26,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26,26,26,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar */}
          <motion.div
            className="lg:w-1/3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-orange block mb-2">
              // KNOWLEDGE_BASE
            </span>

            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-brand-charcoal mb-4">
              DOCS &
              <br />
              <span className="font-serif italic font-light text-brand-charcoal/50">
                FAQ
              </span>
            </h2>

            <p className="font-lora text-brand-charcoal/60 mb-8">
              Common questions and technical documentation for the Simulark
              platform.
            </p>

            {/* Quick Links */}
            <div className="space-y-3 pt-6 border-t border-brand-charcoal/10">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/40 block mb-4">
                // QUICK_LINKS
              </span>
              {[
                { label: "Documentation", href: "/docs" },
                { label: "API Reference", href: "/reference" },
                { label: "GitHub", href: "#" },
                { label: "Community", href: "#" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 font-mono text-xs text-brand-charcoal/60 hover:text-brand-orange transition-colors group"
                >
                  <span className="text-brand-charcoal/30 group-hover:text-brand-orange">
                    [""
                  </span>
                  <span className="uppercase">{link.label}</span>
                  <span className="text-brand-charcoal/30 group-hover:text-brand-orange">
                    ""]
                  </span>
                  <Icon
                    icon="lucide:arrow-up-right"
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              ))}
            </div>

            {/* Support */}
            <div className="mt-8 p-4 border border-brand-charcoal/10 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
                <span className="font-mono text-[9px] uppercase text-brand-charcoal/40">
                  SUPPORT_ONLINE
                </span>
              </div>
              <p className="font-mono text-xs text-brand-charcoal/60">
                Need help? Our team is available 24/7.
              </p>
            </div>
          </motion.div>

          {/* FAQ List */}
          <div className="lg:w-2/3 space-y-3">
            {documentation.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
