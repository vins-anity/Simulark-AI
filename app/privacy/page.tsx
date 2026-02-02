import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function PrivacyPolicy() {
    return (
        <MarketingLayout>
            <div className="pt-32 pb-24 px-6 bg-[#faf9f5]">
                <div className="container mx-auto max-w-3xl">
                    <div className="prose prose-lg prose-stone max-w-none font-lora">
                        <h1 className="font-poppins text-4xl font-bold tracking-tight mb-8 text-brand-charcoal">Privacy Policy</h1>
                        <p className="lead text-xl text-brand-charcoal/80 mb-8">
                            Your privacy is important to us. This policy outlines how Simulark collects, uses, and protects your data.
                        </p>

                        <section className="mb-8">
                            <h2 className="font-poppins text-2xl font-semibold mb-4 text-brand-charcoal">1. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us, such as when you create an account, create a project, or contact us for support. This may include your name, email address, and project details.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="font-poppins text-2xl font-semibold mb-4 text-brand-charcoal">2. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to provide, maintain, and improve our services, including to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Process your transactions and manage your account.</li>
                                <li>Send you technical notices, updates, security alerts, and support messages.</li>
                                <li>Respond to your comments, questions, and requests.</li>
                                <li>Understand and analyze how you use our services to improve them.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="font-poppins text-2xl font-semibold mb-4 text-brand-charcoal">3. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="font-poppins text-2xl font-semibold mb-4 text-brand-charcoal">4. Updates to this Policy</h2>
                            <p>
                                We may update this privacy policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, providing you with additional notice.
                            </p>
                        </section>

                        <p className="text-sm text-brand-charcoal/60 mt-12 pt-8 border-t border-brand-charcoal/10">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
