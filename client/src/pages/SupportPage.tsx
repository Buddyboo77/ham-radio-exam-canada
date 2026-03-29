import { Link } from "wouter";
import { ArrowLeft, HelpCircle, Mail, BookOpen, Radio, MessageSquare } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="p-2">
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="text-blue-300 hover:text-blue-100 p-1">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <HelpCircle className="text-blue-400" size={24} />
          <h1 className="text-lg font-mono text-blue-100">Support</h1>
        </div>
      </div>
      <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700 space-y-4 max-h-[75vh] overflow-y-auto">
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold text-gray-100 mb-1">Ham Radio Exam Canada - Morse</h2>
          <p className="text-gray-400 text-xs">We're here to help you succeed on your exam!</p>
        </div>
        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
            <Mail size={16} className="text-blue-400" />
            Contact Us
          </h3>
          <div className="bg-gray-700 bg-opacity-50 rounded p-3 text-xs text-gray-300 space-y-2">
            <p>For support, questions, or feedback, please email us at:</p>
            <a href="mailto:swatpuppies@hotmail.com" className="text-blue-400 font-semibold text-sm block">
              swatpuppies@hotmail.com
            </a>
            <p className="text-gray-400">We typically respond within 1-2 business days.</p>
          </div>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
            <BookOpen size={16} className="text-blue-400" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-700 bg-opacity-50 rounded p-3">
              <p className="text-xs font-semibold text-gray-200 mb-1">Which exam does this app prepare me for?</p>
              <p className="text-xs text-gray-400">This app covers the official ISED Canada amateur radio exam question bank. All 630 official questions are included.</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded p-3">
              <p className="text-xs font-semibold text-gray-200 mb-1">Does the app work offline?</p>
              <p className="text-xs text-gray-400">Yes! Once loaded, the app works offline so you can study anywhere.</p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded p-3">
              <p className="text-xs font-semibold text-gray-200 mb-1">Are the exam questions up to date?</p>
              <p className="text-xs text-gray-400">Yes - we use the official ISED Canada question bank (July 15, 2025 edition).</p>
            </div>
          </div>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
            <Radio size={16} className="text-blue-400" />
            About the App
          </h3>
          <div className="bg-gray-700 bg-opacity-50 rounded p-3 text-xs text-gray-300 space-y-1">
            <p><span className="text-gray-400">Developer:</span> Janeen Maika</p>
            <p><span className="text-gray-400">Version:</span> 1.0</p>
            <p><span className="text-gray-400">Platform:</span> iOS</p>
          </div>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-400" />
            Report a Bug
          </h3>
          <div className="bg-gray-700 bg-opacity-50 rounded p-3 text-xs text-gray-300">
            <p>Found a bug or incorrect question? Email us at:</p>
            <a href="mailto:swatpuppies@hotmail.com?subject=Bug Report - Ham Radio Exam Canada" className="text-blue-400 font-semibold block mt-2">
              swatpuppies@hotmail.com
            </a>
          </div>
        </section>
        <div className="flex gap-3 pt-2">
          <Link href="/privacy">
            <button className="text-xs text-blue-400 underline">Privacy Policy</button>
          </Link>
          <Link href="/terms">
            <button className="text-xs text-blue-400 underline">Terms of Service</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
