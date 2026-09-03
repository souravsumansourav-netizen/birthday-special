import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { differenceInDays, startOfDay, parseISO } from 'date-fns';

const START_DATE = new Date('2026-09-03T00:00:00'); // Assuming start date is Sept 3
const END_DATE = new Date('2026-10-01T00:00:00');
const TOTAL_DAYS = differenceInDays(END_DATE, START_DATE);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const revealAll = searchParams.get('revealAll') === 'true';

    const { data: surprises, error } = await supabase
      .from('surprises')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!surprises || surprises.length === 0) {
      return NextResponse.json({ surprises: [], totalRevealed: 0 });
    }

    if (revealAll) {
      return NextResponse.json({ surprises, totalRevealed: surprises.length });
    }

    const today = startOfDay(new Date());
    const startDate = startOfDay(START_DATE);
    
    // Calculate how many days have passed since start date
    let daysPassed = differenceInDays(today, startDate) + 1; // +1 to include today
    
    if (daysPassed < 0) daysPassed = 0;
    if (daysPassed > TOTAL_DAYS) daysPassed = TOTAL_DAYS;

    const totalImages = surprises.length;
    
    // We want to pace the reveals evenly. If they haven't uploaded all images yet, 
    // we assume there will be at least TOTAL_DAYS images eventually (1 per day).
    const assumedTotal = Math.max(totalImages, TOTAL_DAYS);
    let imagesToReveal = Math.round((daysPassed / TOTAL_DAYS) * assumedTotal);

    // Ensure at least 1 image is revealed if any exist
    if (imagesToReveal === 0 && totalImages > 0) {
      imagesToReveal = 1;
    }

    // Never reveal more images than actually uploaded
    imagesToReveal = Math.min(imagesToReveal, totalImages);

    // If today is exactly or past Oct 1, reveal all
    if (today >= startOfDay(END_DATE)) {
      imagesToReveal = totalImages;
    }

    const revealedSurprises = surprises.slice(0, imagesToReveal);

    return NextResponse.json({ 
      surprises: revealedSurprises,
      totalRevealed: imagesToReveal,
      totalImages,
      daysPassed,
      totalDays: TOTAL_DAYS
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
