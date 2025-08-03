import { NextResponse } from "next/server"
import { getORM } from "@/lib/mikro-orm"

export async function POST() {
  try {
    const orm = await getORM()
    const generator = orm.getSchemaGenerator()
    
    // Create schema if it doesn't exist
    await generator.createSchema()
    
    return NextResponse.json({ 
      success: true, 
      message: "Database schema created successfully" 
    })
  } catch (error) {
    console.error("Schema creation error:", error)
    return NextResponse.json({ 
      error: "Failed to create schema",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const orm = await getORM()
    const generator = orm.getSchemaGenerator()
    
    // Check current schema
    const sql = await generator.getCreateSchemaSQL()
    
    return NextResponse.json({ 
      success: true, 
      sql: sql 
    })
  } catch (error) {
    console.error("Schema check error:", error)
    return NextResponse.json({ 
      error: "Failed to check schema",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
