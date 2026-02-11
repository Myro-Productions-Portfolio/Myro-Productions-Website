import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Code2 } from 'lucide-react';
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/portfolio-data';
import type { Metadata } from 'next';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} | Myro Productions`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const hasDetails = project.challenge && project.solution;

  return (
    <main className="min-h-screen bg-carbon">
      {/* Hero Section */}
      <section
        className="relative py-20 px-6"
        style={{ background: project.imageGradient }}
      >
        <div className="absolute inset-0 bg-carbon/60" />
        <div className="relative max-w-5xl mx-auto">
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-2 text-text-primary hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span>Back to Portfolio</span>
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="px-4 py-2 bg-moss-700 text-accent text-sm font-medium rounded-full capitalize">
                {project.category}
              </span>
              {project.projectType && (
                <span className="px-4 py-2 bg-carbon-light text-text-secondary text-sm font-medium rounded-full capitalize">
                  {project.projectType === 'personal' ? 'Personal Project' : 'Client Work'}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary">
              {project.title}
            </h1>

            <p className="text-xl text-text-primary/90 max-w-3xl">
              {project.description}
            </p>

            {project.metrics && project.metrics.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-4">
                {project.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2 px-4 py-2 bg-carbon/50 rounded-lg backdrop-blur-sm">
                    <CheckCircle2 size={18} className="text-accent" />
                    <span className="text-text-primary font-medium">{metric}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {hasDetails ? (
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
          {/* Project Meta Info */}
          {(project.timeline || project.role) && (
            <div className="grid md:grid-cols-2 gap-8 pb-8 border-b border-moss-800">
              {project.timeline && (
                <div>
                  <h3 className="text-sm font-semibold text-moss-300 uppercase tracking-wider mb-2">
                    Timeline
                  </h3>
                  <p className="text-lg text-text-primary">{project.timeline}</p>
                </div>
              )}
              {project.role && (
                <div>
                  <h3 className="text-sm font-semibold text-moss-300 uppercase tracking-wider mb-2">
                    Role
                  </h3>
                  <p className="text-lg text-text-primary">{project.role}</p>
                </div>
              )}
            </div>
          )}

          {/* Challenge Section */}
          {project.challenge && (
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-accent rounded-full" />
                The Challenge
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                {project.challenge}
              </p>
            </div>
          )}

          {/* Solution Section */}
          {project.solution && (
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-moss-400 rounded-full" />
                The Solution
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-8">
                {project.solution}
              </p>

              {/* Tech Stack */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="bg-carbon-light rounded-xl p-6 border border-moss-900">
                  <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Code2 size={24} className="text-accent" />
                    Technology Stack
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 bg-moss-900 text-text-primary text-sm font-medium rounded-lg border border-moss-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {project.results && project.results.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-accent rounded-full" />
                Results & Impact
              </h2>
              <ul className="space-y-4">
                {project.results.map((result, index) => (
                  <li key={index} className="flex items-start gap-4 text-lg">
                    <CheckCircle2 size={24} className="text-accent mt-1 flex-shrink-0" />
                    <span className="text-text-secondary">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center space-y-4">
            <p className="text-xl text-text-secondary">
              Detailed case study coming soon.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-6">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-moss-900 text-text-secondary text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="bg-moss-900 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-carbon font-semibold rounded-lg hover:bg-accent-light transition-colors"
          >
            <ArrowLeft size={20} />
            View All Projects
          </Link>
        </div>
      </div>
    </main>
  );
}
