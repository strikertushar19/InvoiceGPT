import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <div className="space-y-6 max-w-3xl">
                <div className="inline-block animate-bounce bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                    ✨ The Ultimate Invoice Generator
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
                    Create Professional <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                        Tax Invoices
                    </span> Instantly.
                </h1>

                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Upload your Excel data and generate beautiful, compliant PDF invoices in seconds. No more manual data entry errors.
                </p>

                <div className="pt-8">
                    <button
                        onClick={onLogin}
                        className="group bg-black cursor-pointer text-white text-lg px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 mx-auto"
                    >
                        Get Started for Free
                        <ArrowRight className="group-hover:translate-x-1 transition" />
                    </button>
                </div>

                {/* Feature Grid */}

            </div>
        </div>
    );
}
