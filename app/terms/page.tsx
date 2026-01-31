import { LegalLayout } from "@/components/marketing/LegalLayout";

export default function TermsOfService() {
    return (
        <LegalLayout>
            <div className="prose prose-lg prose-stone max-w-none font-lora">
                <h1 className="font-poppins text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
                <p className="lead text-xl text-brand-charcoal/80 mb-8">
                    By accessing or using Simulark, you agree to be bound by these Terms of Service.
                </p>

                <section className="mb-8">
                    <h2 className="font-poppins text-2xl font-semibold mb-4 text-brand-charcoal">1. Use of Services</h2>
                    <p>
                        You may use our services for lawful purposes only. You agree not to interfere with or disrupt the integrity or performance of the services or the data contained therein.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-poppins text-2xl font-semibold mb-4 text-brand-charcoal">2. Intellectual Property</h2>
                    <p>
                        The service and its original content, features, and functionality are and will remain the exclusive property of Simulark Inc. and its licensors. The service is protected by copyright, trademark, and other laws.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-poppins text-2xl font-semibold mb-4 text-brand-charcoal">3. Termination</h2>
                    <p>
                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-poppins text-2xl font-semibold mb-4 text-brand-charcoal">4. Limitation of Liability</h2>
                    <p>
                        In no event shall Simulark Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-poppins text-2xl font-semibold mb-4 text-brand-charcoal">5. Changes</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                    </p>
                </section>

                <p className="text-sm text-brand-charcoal/60 mt-12 pt-8 border-t border-brand-charcoal/10">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>
        </LegalLayout>
    );
}
