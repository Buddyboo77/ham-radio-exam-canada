import { Link } from "wouter";
import { ArrowLeft, FileText, Shield, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-3 mb-4 border border-blue-800">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="text-blue-300 hover:text-blue-100 p-1">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <FileText className="text-blue-400" size={24} />
          <h1 className="text-lg font-mono text-blue-100">Terms of Service</h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-800 bg-opacity-70 rounded-md p-6 border border-gray-700 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-100 mb-2">Canadian Ham Radio License Exam Prep</h2>
          <p className="text-gray-400 text-sm">Last Updated: September 20, 2025</p>
        </div>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-400" />
            Acceptance of Terms
          </h3>
          <div className="text-gray-300 text-sm space-y-2">
            <p>By using this Canadian Ham Radio License Exam Prep app, you agree to these Terms of Service. If you do not agree, please do not use the app.</p>
            <p>This app is designed to help you prepare for your Canadian amateur radio license examination administered by ISED (Innovation, Science and Economic Development Canada).</p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">App Purpose & Educational Use</h3>
          <div className="text-gray-300 text-sm space-y-2">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Educational Tool:</strong> This app provides practice questions and study materials to help you prepare for the official Canadian amateur radio licensing exam</li>
              <li><strong>Not Official:</strong> This app is not affiliated with or endorsed by ISED, Industry Canada, or any official licensing authority</li>
              <li><strong>Supplementary Study:</strong> Use this app alongside official study materials and courses</li>
              <li><strong>No Guarantee:</strong> While we strive for accuracy, we cannot guarantee exam success</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Shield size={18} className="text-blue-400" />
            Permitted Use
          </h3>
          <div className="text-gray-300 text-sm">
            <p>You may use this app for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Personal study and exam preparation</li>
              <li>Educational purposes in amateur radio clubs or classes</li>
              <li>Practice testing to assess your knowledge</li>
              <li>Learning Morse code and amateur radio principles</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <XCircle size={18} className="text-red-400" />
            Prohibited Use
          </h3>
          <div className="text-gray-300 text-sm">
            <p>You may NOT:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Use the app during actual licensing examinations</li>
              <li>Redistribute or sell the content without permission</li>
              <li>Reverse engineer or extract question databases</li>
              <li>Use the app for commercial purposes without authorization</li>
              <li>Attempt to hack, damage, or disrupt the app's operation</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Content Accuracy & Disclaimers</h3>
          <div className="text-gray-300 text-sm space-y-2">
            <div className="bg-yellow-900 bg-opacity-30 p-3 rounded border border-yellow-700">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-200">Important Disclaimer</p>
                  <p className="text-yellow-100 text-xs mt-1">
                    While we make every effort to provide accurate and up-to-date information, amateur radio regulations and exam content may change. 
                    Always verify information with official ISED sources before your examination.
                  </p>
                </div>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Question content is based on publicly available amateur radio materials</li>
              <li>Regulations may change - check current ISED documentation</li>
              <li>Practice questions may not exactly match actual exam format</li>
              <li>We are not responsible for exam results or licensing decisions</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">User Accounts & Data</h3>
          <div className="text-gray-300 text-sm space-y-2">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your progress and scores are stored locally on your device</li>
              <li>You are responsible for backing up your own data if desired</li>
              <li>We may anonymously analyze usage patterns to improve the app</li>
              <li>See our Privacy Policy for detailed information about data handling</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">App Availability</h3>
          <div className="text-gray-300 text-sm space-y-2">
            <p>We strive to keep the app available and up-to-date, but:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We may update, modify, or discontinue features at any time</li>
              <li>The app may be temporarily unavailable for maintenance</li>
              <li>We are not liable for any disruption to your study schedule</li>
              <li>Download content for offline use when possible</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Limitation of Liability</h3>
          <div className="text-gray-300 text-sm space-y-2">
            <p>This app is provided "as is" for educational purposes. We are not liable for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Exam failure or licensing delays</li>
              <li>Inaccurate or outdated information</li>
              <li>Technical issues or data loss</li>
              <li>Any damages resulting from app use</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Amateur Radio Community</h3>
          <div className="text-gray-300 text-sm space-y-2">
            <p>This app supports the amateur radio community by:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Encouraging proper licensing and education</li>
              <li>Promoting amateur radio knowledge and skills</li>
              <li>Supporting newcomers to the hobby</li>
              <li>Upholding amateur radio traditions and values</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Contact & Support</h3>
          <div className="text-gray-300 text-sm">
            <p>For questions about these terms or app support, contact us at: <span className="text-blue-400">support@hamradiolicense.app</span></p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Changes to Terms</h3>
          <div className="text-gray-300 text-sm">
            <p>We may update these Terms of Service. Significant changes will be announced within the app. Continued use after changes indicates acceptance of the updated terms.</p>
          </div>
        </section>

        <div className="border-t border-gray-600 pt-4 mt-6">
          <div className="flex gap-3">
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to App
              </button>
            </Link>
            <Link href="/privacy">
              <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
                <Shield size={16} />
                Privacy Policy
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}