
export async function getSpacyFeature(pyodide: any){
  let python_script = await fetch("/python_modules/getSpacyFeature.py").then((r) => r.text());

  return await pyodide.runPythonAsync(python_script);
}