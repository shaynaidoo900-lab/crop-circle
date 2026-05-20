import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText, Loader2 } from 'lucide-react';
import { formatDate, formatHectares, getNDVILevel } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Field, FieldScan, SoilData, WeatherData } from '@/types/database';

interface ReportGeneratorProps {
  field: Field;
  scan?: FieldScan;
  soilData?: SoilData;
  weather?: WeatherData[];
  className?: string;
}

export function ReportGenerator({
  field,
  scan,
  soilData,
  weather,
  className,
}: ReportGeneratorProps) {
  const [reportTitle, setReportTitle] = useState(`Field Report - ${field.name}`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState<string | null>(null);

  const canGenerate = !!(field && (scan || soilData || (weather && weather.length > 0)));

  const generateReport = async () => {
    if (!canGenerate || isGenerating) return;

    setIsGenerating(true);
    setGeneratedPath(null);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Header
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Crop Circle', margin, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Field Analysis Report', margin, 35);

      yPos = 55;
      doc.setTextColor(0, 0, 0);

      // Report Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(reportTitle, margin, yPos);
      yPos += 10;

      // Generated Date
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`, margin, yPos);
      yPos += 15;

      // Field Information
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Field Information', margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const fieldInfo = [
        ['Field Name', field.name],
        ['Area', formatHectares(field.area_hectares)],
        ['Created', formatDate(field.created_at)],
        ['Latest Scan', scan ? formatDate(scan.scan_date) : 'No scan data'],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: fieldInfo,
        theme: 'plain',
        margin: { left: margin },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold' },
          1: { cellWidth: 80 },
        },
        tableWidth: 120,
      });

      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

      // Health Summary
      if (scan) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Health Summary', margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const ndviLevel = getNDVILevel(scan.ndvi_avg);

        const healthData = [
          ['Health Score', `${scan.health_score}%`],
          ['NDVI Average', scan.ndvi_avg.toFixed(4)],
          ['NDVI Status', ndviLevel],
          ['Satellite Source', scan.satellite_source || 'N/A'],
        ];

        autoTable(doc, {
          startY: yPos,
          head: [],
          body: healthData,
          theme: 'plain',
          margin: { left: margin },
          columnStyles: {
            0: { cellWidth: 40, fontStyle: 'bold' },
            1: { cellWidth: 80 },
          },
          tableWidth: 120,
        });

        yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      }

      // Soil Analysis
      if (soilData) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Soil Analysis', margin, yPos);
        yPos += 8;

        const soilArray = [
          ['pH Level', soilData.ph.toFixed(1)],
          ['Moisture', `${soilData.moisture}%`],
          ['Nitrogen', `${soilData.nitrogen} ppm`],
          ['Phosphorus', `${soilData.phosphorus} ppm`],
          ['Potassium', `${soilData.potassium} ppm`],
          ['Organic Matter', `${soilData.organic_matter}%`],
        ];

        autoTable(doc, {
          startY: yPos,
          head: [],
          body: soilArray,
          theme: 'plain',
          margin: { left: margin },
          columnStyles: {
            0: { cellWidth: 40, fontStyle: 'bold' },
            1: { cellWidth: 80 },
          },
          tableWidth: 120,
        });

        yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      }

      // Weather Summary
      if (weather && weather.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Weather Summary', margin, yPos);
        yPos += 8;

        const weatherArray = weather.slice(0, 3).map((w) => [
          new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          `${Math.round(w.tempHigh)}° / ${Math.round(w.tempLow)}°`,
          `${w.precipitation}mm`,
          `${w.humidity}%`,
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Temp', 'Precip', 'Humidity']],
          body: weatherArray,
          theme: 'striped',
          margin: { left: margin },
        });

        yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      }

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        'This report is generated by Crop Circle - Agricultural Monitoring Platform',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
      doc.text(
        'For informational purposes only. Consult with agricultural experts for decisions.',
        pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );

      // Save
      const fileName = `${field.name.toLowerCase().replace(/\s+/g, '-')}-report-${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base">Generate Report</CardTitle>
            <CardDescription>Export field data as PDF</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Title</label>
          <Input
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Enter report title"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          The report will include:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Field information and metadata</li>
            <li>Health summary and NDVI analysis</li>
            <li>Soil analysis data</li>
            <li>Weather forecast summary</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={generateReport} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </Button>
        {!canGenerate && (
          <p className="text-xs text-muted-foreground text-center">
            Add field data to enable report generation
          </p>
        )}
        {generatedPath && !isGenerating && (
          <p className="text-xs text-green-600 text-center font-medium">
            Report downloaded successfully!
          </p>
        )}
      </CardFooter>
    </Card>
  );
}