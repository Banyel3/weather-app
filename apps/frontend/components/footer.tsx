import { Separator } from "@/components/ui/separator";
import { Youtube, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-12 gap-8 mb-8">
          {/* About Section */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Product Manager Accelerator
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                From entry-level to VP of Product, we support PM professionals
                through every stage of their careers.
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Product Manager Accelerator Program is designed to support PM
              professionals through every stage of their careers. Our community
              has helped hundreds of students fulfill their career aspirations
              through structured learning and mentorship.
            </p>
          </div>

          {/* Services Column 1 */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-semibold text-foreground mb-3">
              Programs & Services
            </h4>
            <div className="space-y-3">
              <div>
                <h6 className="text-sm font-medium text-foreground">
                  🚀 PMA Pro
                </h6>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  End-to-end job hunting program with FAANG-level skills
                  training, unlimited mock interviews, and job referrals. Alumni
                  offers up to $800K/year.
                </p>
              </div>
              <div>
                <h6 className="text-sm font-medium text-foreground">
                  🚀 AI PM Bootcamp
                </h6>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Build real AI products with engineers and data scientists.
                  Launch to 100,000+ PM community.
                </p>
              </div>
              <div>
                <h6 className="text-sm font-medium text-foreground">
                  🚀 PMA Power Skills
                </h6>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sharpen PM skills, leadership abilities, and executive
                  presentation techniques.
                </p>
              </div>
            </div>
          </div>

          {/* Services Column 2 */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-semibold text-foreground mb-3">
              Additional Resources
            </h4>
            <div className="space-y-3">
              <div>
                <h6 className="text-sm font-medium text-foreground">
                  🚀 PMA Leader
                </h6>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Accelerate your career to Director and executive levels. Win
                  in the board room.
                </p>
              </div>
              <div>
                <h6 className="text-sm font-medium text-foreground">
                  🚀 1:1 Resume Review
                </h6>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Killer resume rewrites with interview guarantee.{" "}
                  <a
                    href="https://www.drnancyli.com/pmresume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Get free template
                  </a>
                </p>
              </div>
              <div>
                <h6 className="text-sm font-medium text-foreground">
                  🚀 Free Training
                </h6>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  500+ free courses on{" "}
                  <a
                    href="https://www.youtube.com/c/drnancyli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Youtube className="h-3 w-3" />
                    YouTube
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://www.instagram.com/drnancyli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Instagram className="h-3 w-3" />
                    @drnancyli
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Weather Tracker. All rights reserved.
          </p>
          <p className="font-medium">
            Built by{" "}
            <span className="text-foreground">Vaniel John Cornelio</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
