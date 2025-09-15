import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Map plan IDs to subscription plans
    const planMapping: { [key: string]: string } = {
      'free': 'FREE',
      'trial': 'TRIAL',
      'monthly': 'MONTHLY',
      'yearly': 'YEARLY'
    };

    const subscriptionPlan = planMapping[planId];
    if (!subscriptionPlan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Calculate trial end date if it's a trial plan
    let trialEndDate = null;
    if (subscriptionPlan === 'TRIAL') {
      trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days trial
    }

    // Update or create subscription
    const updatedSubscription = await prisma.subscription.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        plan: subscriptionPlan,
        status: 'ACTIVE',
        trialEndDate: trialEndDate,
      },
      create: {
        userId: session.user.id,
        plan: subscriptionPlan,
        status: 'ACTIVE',
        trialEndDate: trialEndDate,
      },
    });

    return NextResponse.json({ 
      success: true, 
      subscription: updatedSubscription 
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' }, 
      { status: 500 }
    );
  }
} 