"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { TestimonialAvatar } from "@/components/TestimonialAvatar";

type TestimonialItem = {
  id: number;
  name: string;
  city: string;
  text: string;
  rating: number;
  avatarUrl?: string;
};

type TestimonialData = {
  heading: string;
  title: string;
  testimonials: TestimonialItem[];
};

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 4500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", duration: 22 },
    [autoplay],
  );

  const [content, setContent] = useState<TestimonialData>({
    heading: "Apa Kata Mereka?",
    title: "Ribuan pelanggan puas telah merasakan kualitas Zari Honey",
    testimonials: TESTIMONIALS as TestimonialItem[],
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/admin/testimonial-content");
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Error fetching testimonial content:", error);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, content.testimonials]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-20 lg:py-32 bg-amber-50/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {content.heading}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {content.title}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          <div className="overflow-hidden -mx-1 sm:-mx-2" ref={emblaRef}>
            <div className="flex touch-pan-y gap-6 sm:gap-8 lg:gap-10 pl-1 pr-1 sm:pl-2 sm:pr-2">
              {content.testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-0.75rem)] lg:flex-[0_0_calc(33.333%-1.35rem)]"
                >
                  <Card className="h-full bg-white border-2 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
                      <div className="flex gap-4 items-start">
                        <TestimonialAvatar
                          name={testimonial.name}
                          avatarUrl={testimonial.avatarUrl}
                          size="lg"
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1 mb-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0"
                              />
                            ))}
                          </div>
                          <p className="font-bold text-gray-900">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {testimonial.city}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed italic border-t border-amber-100 pt-4">
                        &ldquo;{testimonial.text}&rdquo;
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-10">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50"
              aria-label="Testimoni sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50"
              aria-label="Testimoni berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
