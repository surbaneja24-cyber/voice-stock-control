import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="w-full border-t border-zinc-800 mt-40">

            <div className="max-w-7xl mx-auto px-6 py-16">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Logo */}
                    <div>
                        <h2 className="text-2xl font-bold">
                            VoxStock
                        </h2>

                        <p className="text-zinc-400 mt-4">
                            AI-powered inventory management through
                            voice commands and real-time stock control.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="font-semibold mb-4">
                            Product
                        </h3>

                        <ul className="space-y-3 text-zinc-400">
                            <li>Features</li>
                            <li>Pricing</li>
                            <li>Security</li>
                            <li>Integrations</li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold mb-4">
                            Company
                        </h3>

                        <ul className="space-y-3 text-zinc-400">
                            <li>About Us</li>
                            <li>Careers</li>
                            <li>Contact</li>
                            <li>Blog</li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold mb-4">
                            Support
                        </h3>

                        <ul className="space-y-3 text-zinc-400">
                            <li>FAQ</li>
                            <li>Documentation</li>
                            <li>Help Center</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">

                    <p className="text-zinc-500">
                        © 2026 VoxStock. All rights reserved.
                    </p>

                    <div className="flex gap-6 mt-4 md:mt-0 text-zinc-500">
                        <Link to="/privacy" className="hover:text-white transition">
                            Privacy Policy
                        </Link>

                        <Link to="/terms" className="hover:text-white transition">
                            Terms of Service
                        </Link>

                        <Link to="/cookies" className="hover:text-white transition">
                            Cookies
                        </Link>
                    </div>

                </div>

            </div>

        </footer>
    );
}

export default Footer;