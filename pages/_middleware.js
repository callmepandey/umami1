import { NextResponse } from 'next/server';

function customCollectEndpoint(req) {
  const collectEndpoint = process.env.COLLECT_API_ENDPOINT;

  if (collectEndpoint) {
    const url = req.nextUrl.clone();
    const { pathname } = url;

    if (pathname.endsWith(collectEndpoint)) {
      url.pathname = '/api/collect';
      return NextResponse.rewrite(url);
    }
  }
}

function customScriptName(req) {
  const scriptName = process.env.TRACKER_SCRIPT_NAME;

  if (scriptName) {
    const url = req.nextUrl.clone();
    const { pathname } = url;
    const names = scriptName.split(',').map(name => name.trim() + '.js');

    if (names.find(name => pathname.endsWith(name))) {
      url.pathname = '/umami.js';
      return NextResponse.rewrite(url);
    }
  }
}

function forceSSL(req, res) {
  if (process.env.FORCE_SSL && req.nextUrl.protocol === 'http:') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return res;
}

export function middleware(req) {
  const fns = [customCollectEndpoint, customScriptName];

  for (const fn of fns) {
    const res = fn(req);
    if (res) {
      return res;
    }
  }

  return forceSSL(req, NextResponse.next());
}
