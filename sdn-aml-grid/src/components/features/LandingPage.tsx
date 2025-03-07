import React from 'react';
import { UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const features = [
    {
      title: 'Real-Time Sanctions List Monitoring',
      description: 'Stay updated with real-time sanctions list updates from OFAC, UK, EU, and FATF'
    },
    {
      title: 'AI-Powered Risk Scoring',
      description: 'Detect anomalies and assess risks using advanced machine learning algorithms'
    },
    {
      title: 'Automated Alerts',
      description: 'Receive instant notifications for high-risk activities and flagged transactions'
    },
    {
      title: 'API Integration',
      description: 'Seamlessly integrate compliance tools into your existing systems'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-emerald-400 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Welcome to SDN AML GRID
          </h1>
          <p className="text-lg text-slate-700 mb-8">
            Redefining Financial Compliance with Real-Time Risk Monitoring
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/dashboard" className="btn-secondary">
              Request a Demo
            </Link>
            <Link to="/dashboard" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
          Key Features
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-emerald-400 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">
            What Our Users Say
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-lg text-slate-700 mb-6 italic">
              "Since using SDN AML GRID, our compliance process is 40% more efficient."
            </p>
            <div className="flex items-center justify-center gap-3">
              <UserCircle className="w-12 h-12 text-slate-400" />
              <div className="text-left">
                <p className="font-semibold text-slate-800">John Doe</p>
                <p className="text-slate-600">Compliance Officer at XYZ Bank</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          <Link to="/dashboard" className="btn-secondary">
            Request a Demo
          </Link>
          <Link to="/dashboard" className="btn-primary">
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} SDN AML GRID. All rights reserved.</p>
          <p className="mt-2">Providing industry-leading compliance tools for financial institutions.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
