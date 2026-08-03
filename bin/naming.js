export function resolveIconName(baseName, pattern = "{name}Icon") {
  if (typeof pattern !== 'string') pattern = "{name}Icon";
  let rawName = pattern.replaceAll("{name}", baseName);
  const parts = rawName.split(/[^a-zA-Z0-9]+/);
  const pascalParts = parts.map(part => {
    if (!part) return "";
    return part.charAt(0).toUpperCase() + part.slice(1);
  });
  let finalName = pascalParts.join("");
  if (/^[0-9]/.test(finalName)) {
    finalName = "Icon" + finalName;
  }
  return finalName;
}

export function validateIconNamePattern(pattern) {
  if (pattern && typeof pattern === 'string' && !pattern.includes('{name}')) {
    throw new Error(`The pattern must contain the "{name}" token.`);
  }
  const testPattern = pattern || "{name}Icon";
  const testResolved = resolveIconName("TestIcon", testPattern);
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(testResolved)) {
    throw new Error(`The pattern "${testPattern}" produces an invalid JavaScript identifier.`);
  }
}
