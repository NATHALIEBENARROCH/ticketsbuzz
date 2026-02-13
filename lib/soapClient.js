import { getToken } from './tokenManager.js';
import { parseSoapResponse } from './soapParser.js';

/**
 * Cliente SOAP para TicketNetwork v4.0
 * Los endpoints usan XML/SOAP, no JSON
 */

const SOAP_ENDPOINT = 'https://api.ticketnetwork.com/TNWebservices/v4/TNWebservice.asmx';
const WCID = parseInt(process.env.TN_WCID || '23933');

function buildSoapEnvelope(method, params) {
  const paramXml = Object.entries(params)
    .map(([key, value]) => `<${key}>${escapeXml(String(value))}</${key}>`)
    .join('');

  const username = process.env.TN_USERNAME || '';
  const password = process.env.TN_PASSWORD || '';

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://tnwebservices.ticketnetwork.com/tnwebservice/v4.0">
  <soap:Header>
    <tns:ServiceAuthHeader>
      <tns:Username>${escapeXml(username)}</tns:Username>
      <tns:Password>${escapeXml(password)}</tns:Password>
    </tns:ServiceAuthHeader>
  </soap:Header>
  <soap:Body>
    <tns:${method}>
      ${paramXml}
    </tns:${method}>
  </soap:Body>
</soap:Envelope>`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function getEvents(options = {}) {
  const params = {
    websiteConfigID: WCID,
    numberOfEvents: options.numberOfEvents || 50,
    eventID: options.eventID || null,
    eventName: options.eventName || '',
    eventDate: options.eventDate || '0001-01-01T00:00:00',
    beginDate: options.beginDate || '0001-01-01T00:00:00',
    endDate: options.endDate || '2099-12-31T23:59:59',
    venueID: options.venueID || null,
    venueName: options.venueName || '',
    stateProvDesc: options.stateProvDesc || '',
    stateID: options.stateID || null,
    cityZip: options.cityZip || '',
    nearZip: options.nearZip || '',
    parentCategoryID: options.parentCategoryID || null,
    childCategoryID: options.childCategoryID || null,
    grandchildCategoryID: options.grandchildCategoryID || null,
    performerID: options.performerID || null,
    performerName: options.performerName || '',
    noPerformers: options.noPerformers || false,
    lowPrice: options.lowPrice || null,
    highPrice: options.highPrice || null,
    modificationDate: options.modificationDate || '0001-01-01T00:00:00',
    onlyMine: options.onlyMine || false,
    whereClause: options.whereClause || '',
    orderByClause: options.orderByClause || '',
  };

  const soap = buildSoapEnvelope('GetEvents', params);
  const token = await getToken();

  try {
    const response = await fetch(SOAP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tnwebservices.ticketnetwork.com/tnwebservice/v4.0/GetEvents',
        'Authorization': `Bearer ${token}`,
      },
      body: soap,
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.error('SOAP Error:', text.substring(0, 500));
      throw new Error(`SOAP request failed: ${response.status}`);
    }

    let parsed = null;
    let parseError = null;
    try {
      parsed = parseSoapResponse(text, 'GetEvents');
    } catch (error) {
      parseError = error.message;
    }

    return {
      status: response.status,
      xml: text,
      parsed,
      parseError,
    };
  } catch (error) {
    console.error('❌ SOAP GetEvents error:', error.message);
    throw error;
  }
}

export async function getTickets(eventId, options = {}) {
  const params = {
    websiteConfigID: WCID,
    numberOfRecords: options.numberOfRecords || 100,
    eventID: eventId,
    lowPrice: options.lowPrice || null,
    highPrice: options.highPrice || null,
    ticketGroupID: options.ticketGroupID || null,
    requestedTixSplit: options.requestedTixSplit || null,
    whereClause: options.whereClause || '',
    orderByClause: options.orderByClause || '',
  };

  const soap = buildSoapEnvelope('GetTickets', params);
  const token = await getToken();

  try {
    const response = await fetch(SOAP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tnwebservices.ticketnetwork.com/tnwebservice/v4.0/GetTickets',
        'Authorization': `Bearer ${token}`,
      },
      body: soap,
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.error('SOAP Error:', text.substring(0, 500));
      throw new Error(`SOAP request failed: ${response.status}`);
    }

    let parsed = null;
    let parseError = null;
    try {
      parsed = parseSoapResponse(text, 'GetTickets');
    } catch (error) {
      parseError = error.message;
    }

    return {
      status: response.status,
      xml: text,
      parsed,
      parseError,
    };
  } catch (error) {
    console.error('❌ SOAP GetTickets error:', error.message);
    throw error;
  }
}
