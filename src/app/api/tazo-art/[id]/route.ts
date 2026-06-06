import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Remove a tazo art
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.tazoArt.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Tazo art not found' },
        { status: 404 }
      );
    }

    await db.tazoArt.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tazo art:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tazo art' },
      { status: 500 }
    );
  }
}

// PATCH - Update a tazo art (toggle favorite, update stats)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.tazoArt.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Tazo art not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (typeof body.isFavorite === 'boolean') updateData.isFavorite = body.isFavorite;
    if (body.name) updateData.name = body.name;
    if (body.attack != null) updateData.attack = body.attack;
    if (body.defense != null) updateData.defense = body.defense;
    if (body.resistance != null) updateData.resistance = body.resistance;
    if (body.weight != null) updateData.weight = body.weight;
    if (body.stability != null) updateData.stability = body.stability;
    if (body.spin != null) updateData.spin = body.spin;
    if (body.control != null) updateData.control = body.control;
    if (body.bounce != null) updateData.bounce = body.bounce;
    if (body.precision != null) updateData.precision = body.precision;

    const updated = await db.tazoArt.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating tazo art:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tazo art' },
      { status: 500 }
    );
  }
}
