import { Link } from "wouter";
import { ArrowLeft, Shield, Database, Eye, Phone, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="p-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-2 mb-3 border border-blue-800">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="text-blue-300 hover:text-blue-100 p-1">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <Shield className="text-blue-400" size={24} />
          <h1 className="text-lg font-mono text-blue-100">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-800 bg-opacity-70 rounded-md p-3 border border-gray-700 space-y-4 max-h-[65vh] overflow-y-auto">
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold text-gray-100 mb-1">SignalAce Canada</h2>
          <p className="text-gray-400 text-xs">Last Updated: November 5, 2025</p>
        </div>

        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
            <Database size={16} className="text-blue-400" />
            Information We Collect
          </h3>
          <div className="space-y-2 text-gray-300 text-xs">
            <p>This app is designed to protect your privacy while providing effective amateur radio license preparation:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Practice Exam Data:</strong> Your quiz scores and progress are stored locally on your device to track your improvement.</li>
              <li><strong>Study Progress:</strong> Which questions you've practiced and your performance statistics are saved locally.</li>
              <li><strong>App Usage:</strong> Basic analytics about which features you use to improve the app experience.</li>
              <li><strong>No Personal Information:</strong> We do not collect names, email addresses, or other personal identifiers.</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
            <Eye size={16} className="text-green-400" />
            How We Use Your Information
          </h3>
          <div className="text-gray-300 text-xs space-y-1">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Track your learning progress and provide personalized study recommendations</li>
              <li>Identify areas where you need more practice</li>
              <li>Improve app performance and add new features</li>
              <li>All data processing happens locally on your device when possible</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2">Data Storage & Security</h3>
          <div className="text-gray-300 text-xs space-y-1">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Local Storage:</strong> Most of your data is stored locally on your device</li>
              <li><strong>No Third-Party Sharing:</strong> We do not sell or share your data with third parties</li>
              <li><strong>Secure Connection:</strong> All communication with our servers uses encrypted HTTPS</li>
              <li><strong>Data Minimization:</strong> We only collect data necessary for app functionality</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2">Your Rights</h3>
          <div className="text-gray-300 text-xs space-y-1">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Delete your local data by clearing the app's storage</li>
              <li>Export your progress data</li>
              <li>Use the app offline without data transmission</li>
              <li>Contact us with privacy concerns</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2">Children's Privacy</h3>
          <div className="text-gray-300 text-xs">
            <p>This app is designed for amateur radio education and may be used by young people interested in radio technology. We do not knowingly collect personal information from children under 13. The app focuses on educational content with minimal data collection.</p>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
            <Phone size={16} className="text-yellow-400" />
            Contact Us
          </h3>
          <div className="text-gray-300 text-xs space-y-1">
            <p>If you have questions about this Privacy Policy or your data:</p>
            <div className="flex items-center gap-2 mt-1">
              <Mail size={14} className="text-blue-400" />
              <span>Email: privacy@signalace.app</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-200 mb-2">Changes to This Policy</h3>
          <div className="text-gray-300 text-xs">
            <p>We may update this Privacy Policy occasionally. Significant changes will be announced within the app. Continued use after changes indicates acceptance of the updated policy.</p>
          </div>
        </section>

        <div className="border-t border-gray-600 pt-3 mt-4">
          <Link href="/auth">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs flex items-center gap-2 mx-auto">
              <ArrowLeft size={14} />
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}