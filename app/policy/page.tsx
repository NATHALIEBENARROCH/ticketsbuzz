import React from "react";

const PolicyPage = () => (
  <main style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
    <h1>Policy / Terms and Conditions</h1>
    <p>This page contains our policy and terms & conditions.</p>
    {/* External script as requested */}
    <div id="external-policy-script">
      <script
        language="javascript"
        src="http://tickettransaction.com/?bid=4579&sitenumber=23&tid=600"
      ></script>
    </div>
  </main>
);

export default PolicyPage;
