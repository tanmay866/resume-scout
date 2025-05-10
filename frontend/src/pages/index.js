import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | Resume Scout</title>
        <meta name="description" content="AI-powered resume analyzer and job matching platform" />
      </Head>

      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <h1 className="display-4 fw-bold mb-3">
                Smart AI-Powered Resume Screening for Better Hiring!
              </h1>
              <p className="fs-5 mb-4">
                Our advanced AI-powered platform analyzes resumes, matches them with job descriptions, and helps you find the perfect candidates.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link href="/upload-resume" className="btn btn-light btn-lg">
                  Upload Resume
                </Link>
                <Link href="/job-matching" className="btn btn-outline-light btn-lg">
                  Start Screening
                </Link>
              </div>
            </div>
            <div className="col-md-6 text-center">
              <div className="position-relative">
                <div className="rounded-circle overflow-hidden border border-4 border-white shadow mx-auto" style={{ width: '280px', height: '280px', position: 'relative' }}>
                  <Image 
                    src="/images/jobseeker.jpg" 
                    alt="Job Interview" 
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-primary mb-3">How Resume Scout Works</h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Our AI-powered platform streamlines the recruitment process in three simple steps.
            </p>
          </div>
          
          <div className="row g-4">
            {/* Step 1 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <span className="fs-4 fw-bold text-primary">1</span>
                  </div>
                  <h3 className="h4 fw-bold text-primary mb-2">Upload Resume</h3>
                  <p className="text-muted">
                    Upload candidate resumes in PDF or DOCX format. Our AI will automatically parse and analyze them.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <span className="fs-4 fw-bold text-primary">2</span>
                  </div>
                  <h3 className="h4 fw-bold text-primary mb-2">AI Analysis</h3>
                  <p className="text-muted">
                    Our AI analyzes skills, experience, and qualifications to create a comprehensive profile for each candidate.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <span className="fs-4 fw-bold text-primary">3</span>
                  </div>
                  <h3 className="h4 fw-bold text-primary mb-2">Match & Rank</h3>
                  <p className="text-muted">
                    Get ranked matches between job descriptions and candidates, with detailed scoring and insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-primary mb-3">Key Features</h2>
            <p className="fs-5 text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Discover how Resume Scout can transform your recruitment process.
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-primary mb-3">
                    <i className="fas fa-robot fa-2x"></i>
                  </div>
                  <h3 className="h5 fw-bold">AI-Powered Analysis</h3>
                  <p className="text-muted mb-0">Advanced AI algorithms analyze resumes with high accuracy.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-primary mb-3">
                    <i className="fas fa-search fa-2x"></i>
                  </div>
                  <h3 className="h5 fw-bold">Smart Matching</h3>
                  <p className="text-muted mb-0">Intelligent matching between job requirements and candidate skills.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-primary mb-3">
                    <i className="fas fa-chart-bar fa-2x"></i>
                  </div>
                  <h3 className="h5 fw-bold">Detailed Reports</h3>
                  <p className="text-muted mb-0">Comprehensive reports with actionable insights.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-primary mb-3">
                    <i className="fas fa-clock fa-2x"></i>
                  </div>
                  <h3 className="h5 fw-bold">Time Saving</h3>
                  <p className="text-muted mb-0">Reduce screening time by up to 75% with automated analysis.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 mb-4 mb-lg-0">
              <h2 className="display-6 fw-bold mb-3">Ready to transform your recruitment process?</h2>
              <p className="fs-5 mb-0">Join thousands of companies using Resume Scout to find the best talent.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link href="/register" className="btn btn-light btn-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
