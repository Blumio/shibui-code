#include "snapshot.hpp"

#include <cassert>
#include <string>

void RunWindowSnapTests();

void TestNormalizesLineEndings() {
  const std::string input = "line1\r\nline2\rline3\n";
  const std::string expected = "line1\nline2\nline3";
  assert(NormalizeSnapshotPayload(input) == expected);
}

void TestStripsNulBytes() {
  const std::string input = std::string("abc\0def", 7);
  const std::string expected = "abcdef";
  assert(NormalizeSnapshotPayload(input) == expected);
}

void TestEmptyFallback() {
  const std::string input = "\r\n\t  \n";
  const std::string expected = "Shibui-Code session\n\n(no content)";
  assert(NormalizeSnapshotPayload(input) == expected);
}

int main() {
  TestNormalizesLineEndings();
  TestStripsNulBytes();
  TestEmptyFallback();
  RunWindowSnapTests();
  return 0;
}
